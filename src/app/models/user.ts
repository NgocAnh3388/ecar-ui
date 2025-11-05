export class User {
    id = 0;
    fullName = '';
    phoneNo = '';
    email = '';
    roles: string[] = [];
    active = false;
    createdAt: Date | null = null;

    constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }

    static fromJSON(jsonStr: string): User {
        let obj: unknown;
        try {
            obj = JSON.parse(jsonStr);
        } catch {
            throw new Error('Invalid JSON');
        }
        // ép kiểu an toàn: chỉ nhận các field hợp lệ
        const { id, email, roles, active, createdDate, fullName, phoneNo } = (obj as any) ?? {};
        return new User({
            id: Number(id) || 0,
            email: typeof email === 'string' ? email : '',
            phoneNo: typeof phoneNo === 'string' ? phoneNo : '',
            fullName: typeof fullName === 'string' ? fullName : '',
            roles: Array.isArray(roles) ? roles.map(String) : [],
            active: Boolean(active),
        });
    }
}
