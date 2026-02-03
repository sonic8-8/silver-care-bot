export interface ScreenHeaderMeta {
    title: string;
    subtitle?: string;
}

export interface ScreenLayoutProps {
    header?: ScreenHeaderMeta;
    className?: string;
}
