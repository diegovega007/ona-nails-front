const NailIcon = ({ className = "w-5 h-5" }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 48 48">
            <g fill="none" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M44 24c0 11.046-8.954 20-20 20S4 35.046 4 24S12.954 4 24 4"/>
                <path d="m38 9.472l.343 1.056h1.11l-.898.652l.343 1.056l-.898-.652l-.898.652l.343-1.056l-.898-.652h1.11z"/>
                <rect width="12" height="24" x="18" y="13" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" rx="6"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 25c-2 0-5 2.118-5 6v9.784M30 25c2 0 5 2.118 5 6v9.5"/>
            </g>
        </svg>
    )
}

export default NailIcon;
