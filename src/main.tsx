import React, { useState, useEffect, useMemo } from 'react';
import './index.css';

// 画像ファイルをインポートします
import PlusIconSrc from '../images/plus.png';
import BinIconSrc from '../images/bin.png';

// メモの型定義
interface Note {
  id: number;
  content: string;
  timestamp: string;
}

// アイコンコンポーネント
const PlusIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <img src={PlusIconSrc} alt="新しいメモ" width="20" height="20" {...props} />
);

const TrashIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <img src={BinIconSrc} alt="削除" width="16" height="16" {...props} />
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
            // 最新のメモが一番上に来るようにソートされている前提で最初のメモを選択
            if (parsedNotes.length > 0) {
                const sorted = [...parsedNotes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setSelectedNoteId(sorted[0].id);
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
        const newSelectedId = sortedNotes.find(n => n.id !== selectedNoteId)?.id || null;
        setSelectedNoteId(newSelectedId);
    };
    
    const { title: selectedNoteTitle } = selectedNote ? getNotePreview(selectedNote.content) : { title: '' };

    return (
        <div className="font-sans h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                {/* ヘッダー */}
                <header className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    </div>
                    <h1 className="text-sm font-semibold text-gray-700">メモ帳アプリ (React)</h1>
                    <div className="w-24 text-sm text-right text-gray-400">{saveStatus}</div>
                </header>

                <div className="flex flex-grow h-full overflow-hidden">
                    {/* サイドバー */}
                    <aside className="w-1/3 md:w-1/4 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
                        <div className="p-2 border-b border-gray-200">
                            <button onClick={handleNewNote} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                                <PlusIcon className="filter invert" />
                                新しいメモ
                            </button>
                        </div>
                        <nav className="flex-grow overflow-y-auto p-2 space-y-1">
                            {sortedNotes.map(note => {
                                const { title, preview } = getNotePreview(note.content);
                                const isSelected = selectedNoteId === note.id;
                                return (
                                    <div
                                        key={note.id}
                                        onClick={() => setSelectedNoteId(note.id)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-gray-200'
                                        }`}
                                    >
                                        <h2 className={`font-semibold truncate text-sm ${isSelected ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
                                        <p className={`text-xs truncate ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{preview}</p>
                                    </div>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* メインエディタ */}
                    <main className="w-2/3 md:w-3/4 flex flex-col bg-white">
                        {selectedNote ? (
                            <>
                                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                                    <h1 className="text-2xl font-bold text-gray-900">{selectedNoteTitle || '新しいメモ'}</h1>
                                </div>
                                <div className="flex-grow p-4 overflow-y-auto">
                                    <textarea
                                        key={selectedNote.id}
                                        value={selectedNote.content}
                                        onChange={(e) => handleUpdateNoteContent(e.target.value)}
                                        className="w-full h-full bg-transparent text-gray-700 focus:outline-none resize-none text-base leading-relaxed"
                                        placeholder="ここに内容を書き始めます..."
                                    />
                                </div>
                                <footer className="p-2 border-t border-gray-200 flex justify-end flex-shrink-0">
                                    <button onClick={handleDeleteNote} className="bg-red-500 text-white font-semibold py-2 px-3 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors text-sm">
                                        <TrashIcon className="filter invert" />
                                        削除
                                    </button>
                                </footer>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-gray-500 p-4">
                                <div>
                                    <h2 className="text-xl font-semibold">メモが選択されていません</h2>
                                    <p className="mt-2">左側のリストからメモを選択するか、「新しいメモ」ボタンで作成してください。</p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Main;