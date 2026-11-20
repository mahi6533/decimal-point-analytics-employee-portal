"""Browser regressions for the production preview. Each test uses a fresh local account."""
import os
import re
import unittest
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


class PortalBrowserChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.runtime = sync_playwright().start()
        cls.addClassCleanup(cls.runtime.stop)
        cls.browser = cls.runtime.chromium.launch(
            executable_path=os.environ.get("CHROMIUM_PATH")
        )
        cls.addClassCleanup(cls.browser.close)

    def open_workspace(self, width):
        context = self.browser.new_context(viewport={"width": width, "height": 900})
        self.addCleanup(context.close)
        page = context.new_page()
        page.set_default_timeout(5000)
        messages = []
        page.on("pageerror", lambda error: messages.append(str(error)))
        page.on("console", lambda item: messages.append(item.text)
                if item.type in {"error", "warning"} else None)
        page.goto(os.environ.get("PORTAL_URL", "http://127.0.0.1:4173/"))
        self.assert_fits(page, "Login")
        page.get_by_role("button", name="Continue to employee workspace").click()
        expect(page.get_by_role("button", name="Apply leave", exact=True)).to_be_visible()
        return page, messages

    def assert_fits(self, page, route):
        page.evaluate("document.fonts.ready")
        widths = page.evaluate("""() => ({
          document: document.documentElement.scrollWidth,
          viewport: document.documentElement.clientWidth
        })""")
        self.assertLessEqual(widths["document"], widths["viewport"], (route, widths))

    def test_all_routes_at_requested_viewports(self):
        for width in (1440, 1280, 768, 390):
            with self.subTest(width=width):
                page, messages = self.open_workspace(width)
                navigation = page.get_by_role("navigation", name="Workspace navigation",
                                              include_hidden=True)
                buttons = navigation.locator("button[title]")
                titles = buttons.evaluate_all("(nodes) => nodes.map(node => node.title)")
                self.assertGreaterEqual(len(set(titles)), 21, "All workspace routes must remain available")
                for title in titles:
                    if width < 1024:
                        page.locator(".mobile-menu").click()
                    button = navigation.get_by_title(title, exact=True)
                    button.click()
                    expect(button).to_have_attribute("aria-current", "page")
                    expect(page.locator(".workspace-body h1").first).to_be_visible()
                    self.assert_fits(page, title)
                self.assertEqual(messages, [], f"Browser diagnostics at {width}px")
                page.context.close()

    def test_engineering_workbench_opens_the_selected_work_item(self):
        page, messages = self.open_workspace(1280)
        for discipline in ("Applied AI", "Software engineering", "Data engineering"):
            card = page.get_by_role("region", name="Engineering workbench").get_by_role("button", name=re.compile(discipline))
            title = card.locator("strong").inner_text()
            card.click()
            dialog = page.get_by_role("dialog", name="Work item")
            expect(dialog.get_by_role("heading", name=title, exact=True)).to_be_visible()
            page.keyboard.press("Escape")
            page.get_by_role("navigation", name="Workspace navigation").get_by_title("Overview", exact=True).click()
        self.assertEqual(messages, [])

    def test_dashboard_dialogs_and_persistence(self):
        page, messages = self.open_workspace(1440)
        page.get_by_role("button", name="Apply leave", exact=True).click()
        dialog = page.get_by_role("dialog")
        expect(dialog.get_by_label("Start date")).to_be_visible()
        dialog.get_by_label("Half-day leave").check()
        expect(dialog.get_by_label("End date")).to_be_disabled()
        page.keyboard.press("Escape")
        expect(dialog).to_have_count(0)
        page.get_by_role("button", name="Log timesheet", exact=True).click()
        expect(dialog.get_by_label("Project or workstream")).to_be_visible()
        page.keyboard.press("Escape")

        page.keyboard.press("Control+k")
        search = page.get_by_placeholder("Search modules, people and policies")
        search.fill("Leave policy")
        page.get_by_role("dialog").get_by_role("button", name=re.compile("Leave policy", re.I)).click()
        expect(page.get_by_role("dialog").get_by_text(re.compile("Weekends and company holidays"))).to_be_visible()
        page.keyboard.press("Escape")

        page.get_by_role("button", name="Use dark theme").click()
        expect(page.locator("html")).to_have_attribute("data-theme", "dark")
        page.reload()
        expect(page.locator("html")).to_have_attribute("data-theme", "dark")
        expect(page.get_by_role("button", name="Open profile menu")).to_be_visible()
        self.assertEqual(messages, [])

    def test_leave_and_shift_persist(self):
        page, messages = self.open_workspace(1280)
        page.get_by_role("button", name="Punch in", exact=True).click()
        page.reload()
        page.get_by_role("button", name="Punch out", exact=True).click()
        expect(page.get_by_role("button", name="Punch in", exact=True)).to_be_visible()
        page.get_by_role("button", name="Apply leave", exact=True).click()
        dialog = page.get_by_role("dialog")
        dialog.get_by_label("Half-day leave").check()
        dialog.get_by_label("Reason").fill("Personal appointment")
        dialog.get_by_role("button", name="Submit request").click()
        expect(dialog).to_have_count(0)
        page.reload()
        first = page.get_by_role("table").first.locator("tbody tr").first
        expect(first).to_contain_text("0.5")
        expect(first).to_contain_text("Pending")
        first.get_by_role("button").click()
        expect(page.get_by_role("table").first).to_contain_text("Personal appointment")
        self.assertEqual(messages, [])

    def test_uploaded_file_survives_reload_and_download(self):
        page, messages = self.open_workspace(1280)
        page.get_by_role("navigation", name="Workspace navigation").get_by_title(
            "Documents", exact=True
        ).click()
        content = b"Quarterly employee reference"
        page.get_by_label("Choose a document").set_input_files({
            "name": "quarter-review.txt", "mimeType": "text/plain", "buffer": content,
        })
        download_button = page.get_by_role("button", name="Download quarter-review.txt")
        expect(download_button).to_be_visible()
        page.reload()
        expect(download_button).to_be_visible()
        with page.expect_download() as result:
            download_button.click()
        self.assertEqual(result.value.suggested_filename, "quarter-review.txt")
        self.assertEqual(Path(result.value.path()).read_bytes(), content)
        self.assertEqual(messages, [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
