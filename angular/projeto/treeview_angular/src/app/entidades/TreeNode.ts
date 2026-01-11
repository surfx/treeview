export interface TreeNode {
    id: string;
    name: string;
    type: 'folder' | 'file';
    checked: boolean;
    isOpen?: boolean;
    indeterminate?: boolean;
    children?: TreeNode[];
}