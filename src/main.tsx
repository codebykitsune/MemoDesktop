import React, { useState, useEffect, useMemo } from 'react';
import './index.css'

// メモの型定義
interface Note {
  id: number;
  content: string;
  timestamp: string;
}

// アイコンコンポーネント
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="./image/bin.png" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);


const Main: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
    const [saveStatus, setSaveStatus] = useState<'保存済み' | '保存中...'>('保存済み');

    // 初回ロード時にローカルストレージからデータを読み込む
    useEffect(() => {
        const savedNotes = localStorage.getItem('desktop-style-notes');
        if (savedNotes) {
            const parsedNotes: Note[] = JSON.parse(savedNotes);
            setNotes(parsedNotes);
            if (parsedNotes.length > 0) {
                setSelectedNoteId(parsedNotes[0].id);
            }
        }
    }, []);

    // notes配列が変更されたらローカルストレージに保存
    useEffect(() => {
        setSaveStatus('保存中...');
        const timer = setTimeout(() => {
            const sortedNotes = [...notes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            localStorage.setItem('desktop-style-notes', JSON.stringify(sortedNotes));
            setSaveStatus('保存済み');
        }, 500); // 擬似的な保存遅延
        return () => clearTimeout(timer);
    }, [notes]);

    const selectedNote = useMemo(() => {
        return notes.find(note => note.id === selectedNoteId) || null;
    }, [selectedNoteId, notes]);
    
    // 表示用にソートされたメモリスト
    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [notes]);

    // メモのタイトルとプレビューを生成
    const getNotePreview = (content: string) => {
        const lines = content.split('\n');
        const title = lines[0].trim() || '新しいメモ';
        const preview = lines[1]?.trim() || '内容なし';
        return { title, preview };
    };

    // 新規メモ作成
    const handleNewNote = () => {
        const newNote: Note = {
            id: Date.now(),
            content: '',
            timestamp: new Date().toISOString(),
        };
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        setSelectedNoteId(newNote.id);
    };

    // メモの内容を更新
    const handleUpdateNoteContent = (content: string) => {
        const updatedNotes = notes.map(note =>
            note.id === selectedNoteId
                ? { ...note, content, timestamp: new Date().toISOString() }
                : note
        );
        setNotes(updatedNotes);
    };

    // メモを削除
    const handleDeleteNote = () => {
        if (selectedNoteId === null) return;
        const remainingNotes = notes.filter(note => note.id !== selectedNoteId);
        setNotes(remainingNotes);
        // 次のメモを選択（なければnull）
        const newSelectedId = remainingNotes.length > 0 ? remainingNotes[0].id : null;
        setSelectedNoteId(newSelectedId);
    };
    
    const { title: selectedNoteTitle } = selectedNote ? getNotePreview(selectedNote.content) : { title: '' };

    return (
        <div className="flex flex-col h-screen bg-gray-100 font-sans">
            {/* ヘッダー */}
            <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
                <h1 className="text-sm font-semibold text-gray-700">メモ帳アプリ (React)</h1>
                <span className="text-sm text-gray-400 w-24 text-right">{saveStatus}</span>
            </header>

            <div className="flex flex-grow min-h-0">
                {/* サイドバー */}
                <aside className="w-1/3 md:w-1/4 lg:w-1/5 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4">
                        <button onClick={handleNewNote} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                            <PlusIcon />
                            新しいメモ
                        </button>
                    </div>
                    <nav className="flex-grow overflow-y-auto">
                        {sortedNotes.map(note => {
                            const { title, preview } = getNotePreview(note.content);
                            return (
                                <div
                                    key={note.id}
                                    onClick={() => setSelectedNoteId(note.id)}
                                    className={`px-4 py-3 cursor-pointer border-l-4 ${selectedNoteId === note.id ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-gray-100'}`}
                                >
                                    <h2 className={`font-bold truncate text-gray-800 ${selectedNoteId === note.id ? 'text-blue-700' : ''}`}>{title}</h2>
                                    <p className="text-sm text-gray-500 truncate">{preview}</p>
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                {/* メインエディタ */}
                <main className="w-2/3 md:w-3/4 lg:w-4/5 flex flex-col">
                    {selectedNote ? (
                        <div className="flex flex-col flex-grow p-6 md:p-8 bg-white m-4 rounded-lg shadow">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedNoteTitle}</h1>
                            <textarea
                                key={selectedNote.id}
                                value={selectedNote.content}
                                onChange={(e) => handleUpdateNoteContent(e.target.value)}
                                className="flex-grow w-full bg-transparent text-gray-700 focus:outline-none resize-none text-base leading-relaxed"
                                placeholder="ここに内容を書き始めます..."
                            />
                            <div className="flex justify-end mt-4">
                                <button onClick={handleDeleteNote} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors text-sm">
                                    <TrashIcon />
                                    削除
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>メモを選択するか、新しいメモを作成してください。</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Main;