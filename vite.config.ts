import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins:[react()],
  build:{rolldownOptions:{output:{codeSplitting:{groups:[
    {name:'react-runtime',test:/node_modules[\/](react|react-dom|scheduler)[\/]/},
    {name:'data-client',test:/node_modules[\/]@supabase[\/]/}
  ]}}}}
});
