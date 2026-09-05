const sizeMap = {
	xs: "flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] font-medium text-[#111111]",
	sm: "flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-[12px] font-medium text-white dark:bg-white dark:text-[#111111]",
	md: "flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-[12px] font-medium text-white dark:bg-white dark:text-[#111111]",
	lg: "flex size-16 items-center justify-center rounded-full bg-white text-[20px] font-medium text-[#111111] ring-1 ring-[#e5e5e5]",
};

export function InitialsAvatar({ name, size = "sm" }: { name: string; size?: keyof typeof sizeMap }) {
	return <span className={sizeMap[size]}>{name.charAt(0).toUpperCase()}</span>;
}