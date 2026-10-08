import { ReactNode } from 'react';
type InputLikeComponent = 'Input' | 'InputNumber' | 'Select' | 'DatePicker' | 'TreeSelect';
/**
 * Chế độ chỉ đọc (giống Kit cũ): field bị disabled nhưng chữ vẫn rõ như bình thường, nền hơi xám —
 * dùng cho form xem chi tiết.
 */
export declare const ReadOnlyProvider: ({ readOnly, component, children, }: {
    readOnly?: boolean;
    component: InputLikeComponent;
    children: ReactNode;
}) => string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import('react').ReactPortal | import('react').ReactElement<unknown, string | import('react').JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
export {};
