export interface Center {
    id: number;           // Khớp với 'id' từ JSON
    centerName: string;   // Khớp với 'centerName' từ JSON
    phoneNo: string;      // Khớp với 'phoneNo' từ JSON
    address: string;      // Khớp với 'address' từ JSON
}

// export class Center {
//     id: number = 0;
//     centerName: string = '';
//     address?: string = ''; // <--- Đã thêm trường này (dấu ? để tránh lỗi null)
//
//     constructor(init?: Partial<Center>) {
//         Object.assign(this, init);
//     }
//
//     static fromJSON(jsonStr: string): Center {
//         let obj: unknown;
//         try {
//             obj = JSON.parse(jsonStr);
//         } catch {
//             throw new Error('Invalid JSON');
//         }
//
//         // Ép kiểu an toàn và lấy thêm address
//         const { id, centerName, address } = (obj as any) ?? {};
//
//         return new Center({
//             id: id,
//             centerName: centerName,
//             address: address // Map thêm address vào đây
//         });
//     }export interface Center {
//     id: number;           // ID tự tăng
//     centerName: string;   // Map từ 'center_name'
//     phoneNo: string;      // Map từ 'phone_no'
//     address: string;      // Map từ 'address'
// }
// }