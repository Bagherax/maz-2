import React, { useState, useEffect } from 'react';
import { useSearch } from '../../context/SearchContext';
import { SparklesIcon } from '../../components/icons/SparklesIcon';
import { MAZDADY_CATEGORIES, getCategoryIcon, getCategoryCount } from '../../constants/categories';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { DefaultCategoryIcon } from '../../components/icons/DefaultCategoryIcon';
import Flag from '../../components/ui/Flag';

const SearchPanel: React.FC = () => {
    const { 
        isPanelOpen, 
        suggestions, 
        loading, 
        executeQueryNow, 
        query, 
        rewrittenQuery, 
        finalResult 
    } = useSearch();
    
    const [categoryPath, setCategoryPath] = useState<string[]>([]);

    useEffect(() => {
        // When the search query is cleared, reset the category path to the top level.
        // This ensures a clean browsing state after a search is performed and then cleared.
        if (!query) {
            setCategoryPath([]);
        }
    }, [query]);

    const handleActionClick = (term: string) => {
        executeQueryNow(term);
    };

    const handleCategoryClick = (categoryName: string) => {
        let currentLevel: any = MAZDADY_CATEGORIES;
        categoryPath.forEach(p => {
            currentLevel = currentLevel[p];
        });

        // If the next level is an object (more sub-categories) or an array of objects
        if (typeof currentLevel[categoryName] === 'object' && currentLevel[categoryName] !== null) {
            setCategoryPath([...categoryPath, categoryName]);
        } else {
            // It's a leaf node (string), so execute search
            executeQueryNow(categoryName);
        }
    };
    
    const handleGoBack = () => {
        setCategoryPath(prev => prev.slice(0, -1));
    };

    const renderCategories = () => {
        let currentLevel: any = MAZDADY_CATEGORIES;
        categoryPath.forEach(p => {
            currentLevel = currentLevel[p];
        });

        const currentTitle = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].replace(/([A-Z])/g, ' $1').trim() : "Browse Categories";
        const items = Array.isArray(currentLevel) ? currentLevel : Object.keys(currentLevel);

        const isCarBrandList = Array.isArray(items) && items.length > 0 && typeof items[0] === 'object' && items[0] !== null && 'flag' in items[0];

        const Header = (
             <div className="flex items-center mb-2 flex-shrink-0">
                {categoryPath.length > 0 && (
                    <button onClick={handleGoBack} className="p-1 rounded-full hover:bg-primary mr-2">
                        <ChevronLeftIcon />
                    </button>
                )}
                <h3 className="text-xs font-bold text-text-secondary uppercase">{currentTitle}</h3>
            </div>
        );

        const gridCols = items.length > 6 ? 'grid-cols-3' : 'grid-cols-2';
        
        const CategoryContent = isCarBrandList ? (
            <div className="flex flex-col gap-1">
                {(items as { name: string; flag: string }[]).map((brand, index) => (
                    <button
                        key={index}
                        onClick={() => handleActionClick(brand.name)}
                        className="w-full flex items-center p-2 text-left bg-primary text-text-primary rounded-md border border-transparent hover:border-border-color hover:bg-border-color transition-colors"
                    >
                        <Flag countryCode={brand.flag} />
                        <span className="ml-3 font-medium text-sm">{brand.name}</span>
                    </button>
                ))}
            </div>
        ) : (
            <div className={`grid ${gridCols} gap-2`}>
                {items.map((item: any, index: number) => {
                    const name = typeof item === 'object' && item.name ? item.name : (typeof item === 'string' ? item : 'Unknown');
                    const icon = getCategoryIcon(name);
                    const subCategory = currentLevel[name];
                    const count = getCategoryCount(subCategory);

                    return (
                         <button 
                            key={index}
                            onClick={() => handleCategoryClick(name)}
                            className="relative flex flex-col items-center justify-center p-2 bg-primary text-text-secondary rounded-lg border border-border-color hover:bg-border-color hover:text-accent transition-colors aspect-square"
                        >
                            <div className="h-6 w-6 mb-1">{icon || <DefaultCategoryIcon />}</div>
                            <span className="text-xs text-center font-medium">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                            {count > 0 && (
                                <div className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold min-w-[1rem] h-4 px-1 rounded-full flex items-center justify-center pointer-events-none">
                                    {count > 99 ? '99+' : count}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        );

        return (
            <div className="flex flex-col flex-grow min-h-0">
                {Header}
                <div className="flex-grow overflow-y-auto -mr-3 pr-3">
                    {CategoryContent}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center text-text-secondary py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
                    <p className="mt-2 text-sm">
                        {rewrittenQuery ? `Thinking about "${rewrittenQuery}"...` : 'Searching...'}
                    </p>
                </div>
            );
        }

        if (finalResult) {
            return (
                <div className="flex-grow overflow-y-auto -mr-3 pr-3">
                    {rewrittenQuery && query !== rewrittenQuery && (
                        <p className="text-xs text-text-secondary mb-2 italic">
                            Searching for: <span className="font-semibold text-text-primary not-italic">{rewrittenQuery}</span>
                        </p>
                    )}
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{finalResult}</p>
                </div>
            );
        }

        if (suggestions.length > 0) {
             return (
                <div className="flex-grow overflow-y-auto -mr-3 pr-3">
                    <h3 className="text-xs font-bold text-accent uppercase mb-2 flex items-center"><SparklesIcon /> <span className="ml-1">AI Suggestions</span></h3>
                    <div className="flex flex-col items-start gap-2">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleActionClick(s)} 
                                className="w-full text-left px-3 py-2 bg-primary text-sm text-text-primary rounded-md border border-transparent hover:border-border-color hover:bg-border-color transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        if (query && !loading) {
            return <div className="text-center text-text-secondary py-4 text-sm">No suggestions. Press Enter to search.</div>;
        }

        // Show categories when query is empty
        return renderCategories();
    };

    return (
        <div 
            className={`absolute top-full left-0 mt-2 w-full bg-secondary rounded-lg border border-border-color shadow-lg p-3 z-30 transition-all duration-300 ease-in-out flex flex-col ${
                isPanelOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
            style={{ maxHeight: '70vh' }}
            onMouseDown={(e) => e.preventDefault()} // Prevents input blur when clicking panel
        >
           {renderContent()}
        </div>
    );
}

export default SearchPanel;
