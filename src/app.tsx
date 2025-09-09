import React from 'react';
import { createRoot } from 'react-dom/client';
import Main from './main';
import './index.css'
// import db from "./firebase";

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
     <Main />
  </React.StrictMode>
);