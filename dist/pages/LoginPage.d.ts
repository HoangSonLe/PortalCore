export interface QuickAccount {
    label: string;
    username: string;
    password: string;
}
export interface LoginPageProps {
    /** Nút đăng nhập nhanh — tiện cho môi trường dev/demo. Đừng dùng ở production. */
    quickAccounts?: QuickAccount[];
}
export declare const LoginPage: ({ quickAccounts }: LoginPageProps) => import("react").JSX.Element;
