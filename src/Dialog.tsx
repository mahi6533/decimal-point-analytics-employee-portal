import {useLayoutEffect,useRef,type ReactNode} from 'react';
import {X} from 'lucide-react';
export default function Dialog({title,close,drawer=false,children}:{title:string;close:()=>void;drawer?:boolean;children:ReactNode}){
  const ref=useRef<HTMLDialogElement>(null);
  useLayoutEffect(()=>{const node=ref.current!;node.showModal();return ()=>node.close()},[]);
  return <dialog ref={ref} className={drawer?'dialog drawer':'dialog'} aria-label={title} onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===ref.current){const r=ref.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}}}>
    <div className="dialog-title no-print"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={close}><X size={18}/></button></div>{children}</dialog>;
}
