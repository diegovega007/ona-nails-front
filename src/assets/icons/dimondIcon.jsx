const DimondIcon = ({ className = "w-5 h-5", color }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <g fill="none" stroke={color || "currentColor"} strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l4 6l-10 12L2 9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 9h20M12 21V9M6 3l4 6m8-6l-4 6"/>
            </g>
        </svg>
    )
}

export default DimondIcon;
