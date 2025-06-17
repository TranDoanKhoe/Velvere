import { useState } from 'react';

export default function ChatLauncher() {
    const [open, setOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat iframe Dialogflow */}
            {open && (
                <div className="w-[360px] h-[480px] mb-2 bg-white rounded-xl shadow-2xl overflow-hidden">
                    <iframe
                        allow="microphone;"
                        width="100%"
                        height="100%"
                        src="https://console.dialogflow.com/api-client/demo/embedded/656b9370-76ec-45ce-9132-5336e0444796"
                        title="Dialogflow Chat"
                    ></iframe>
                </div>
            )}

            {/* Nút tròn bật/tắt chat */}
            <button
                onClick={() => setOpen(!open)}
                className="w-14 h-14 bg-black hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105"
            >
                <img src="/logo.png" alt="Chatbot" className="w-7 h-7" />
            </button>
        </div>
    );
}
