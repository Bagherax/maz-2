import React, { useState, useRef, useEffect } from 'react';
import * as api from '../../api';
import { useNotification } from '../../hooks/useNotification';
import { useSearch } from '../../context/SearchContext';
import SearchPanel from '../../features/search/SearchPanel';

const AskAiSearch: React.FC = () => {
    const {
      isPanelOpen,
      openPanel,
      closePanel,
      query,
      updateQuery,
      loading,
      executeQueryNow
    } = useSearch();
    
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                closePanel();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closePanel]);


    const handleSearch = () => {
        if (!query.trim() || loading) return;
        executeQueryNow(query);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="ask-ai-wrapper" ref={wrapperRef}>
            <div className={`ai-input-container ${isPanelOpen ? 'focused' : ''}`}>
                <span className="underline-effect"></span>
                <span className="ripple-circle"></span>
                <span className="bg-fade"></span>
                <div className="floating-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <input
                    placeholder="Ask MAZ AI"
                    className="ai-input"
                    type="text"
                    value={query}
                    onChange={(e) => updateQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={openPanel}
                    disabled={loading}
                />
                <span className="icon-container" onClick={handleSearch}>
                    {loading ? (
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
                    ) : (
                        <svg
                            viewBox="0 0 24 24"
                            height="24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="ai-icon"
                        >
                            <path
                            d="M7.94 3.078h8.11c1.37 0 2.47 0 3.34.12c.9.12 1.66.38 2.26.98s.86 1.36.98 2.26c.12.87.12 1.97.12 3.34v2.05c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-2c0-1.43 0-2.44-.1-3.19c-.1-.73-.28-1.12-.56-1.4s-.66-.46-1.4-.56c-.76-.1-1.76-.1-3.19-.1H8c-1.43 0-2.44 0-3.19.1c-.73.1-1.12.28-1.4.56s-.46.67-.56 1.4c-.1.76-.1 1.76-.1 3.19s0 2.44.1 3.19c.1.73.28 1.12.56 1.4s.66.46 1.4.56c.76.1 1.76.1 3.19.1h3c.41 0 .75.34.75.75s-.34.75-.75.75H7.95c-1.37 0-2.47 0-3.34-.12c-.9-.12-1.66-.38-2.26-.98s-.86-1.36-.98-2.26c-.12-.87-.12-1.97-.12-3.34v-.11c0-1.37 0-2.47.12-3.34c.12-.9.38-1.66.98-2.26s1.36-.86 2.26-.98c.87-.12 1.97-.12 3.34-.12zm8.76 10.88l-.04.09a4.34 4.34 0 0 1-2.45 2.45l-.09.04c-1.17.46-1.17 2.12 0 2.58l.09.04c1.12.44 2.01 1.33 2.45 2.45l.04.09c.46 1.17 2.12 1.17 2.58 0l.04-.09a4.34 4.34 0 0 1 2.45-2.45l.09-.04c1.17-.46 1.17-2.12 0-2.58l-.09-.04a4.34 4.34 0 0 1-2.45-2.45l-.04-.09c-.46-1.17-2.12-1.17-2.58 0m1.29.81a5.83 5.83 0 0 0 3.06 3.06a5.83 5.83 0 0 0-3.06 3.06a5.83 5.83 0 0 0-3.06-3.06a5.83 5.83 0 0 0 3.06-3.06M6.74 8.828c0-.41-.34-.75-.75-.75s-.75.34-.75.75v2c0 .41.34.75.75.75s.75-.34.75-.75zm8.25-1.75c.41 0 .75.34.75.75v4c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-4c0-.41.34-.75.75-.75m-2.25 2.25c0-.41-.34-.75-.75-.75s-.75.34-.75.75v1c0 .41.34.75.75.75s.75-.34.75-.75zm5.25-.75c.41 0 .75.34.75.75v1c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-1c0-.41.34-.75.75-.75m-8.25-.75c0-.41-.34-.75-.75-.75s-.75.34-.75.75v4c0 .41.34.75.75.75s.75-.34.75-.75z"
                            fillRule="evenodd"
                            ></path>
                        </svg>
                    )}
                </span>
            </div>
            <SearchPanel />
        </div>
    );
};

export default AskAiSearch;