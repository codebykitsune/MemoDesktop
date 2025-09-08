import React from 'react';
import { createRoot } from 'react-dom/client';
// import db from "./firebase";

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <h2>メモ帳</h2>
    <button>新規メモ作成</button>
  </React.StrictMode>
);