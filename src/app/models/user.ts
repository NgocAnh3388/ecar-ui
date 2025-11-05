export class Vehicle {
  licensePlate = '';
  vinNumber: string | null = null;
  nextKm: number | null = null;
  nextDate: string | null = null;
  oldKm: number | null = null;
  oldDate: string | null = null;
  carModel?: {
    id: number;
    carName: string;
    carType: string;
  };

  constructor(init?: Partial<Vehicle>) {
    Object.assign(this, init);
  }
}

export class User {
  id = 0;
  fullName = '';
  phoneNo: string | null = null;
  email = '';
  roles: string[] = [];
  active = false;
  createdAt: Date | null = null;
  vehicles: any[] = [];

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

    const { id, email, roles, active, createdAt, fullName, phoneNo, vehicles } = (obj as any) ?? {};

    const user = new User({
      id: Number(id) || 0,
      email: typeof email === 'string' ? email : '',
      phoneNo: typeof phoneNo === 'string' ? phoneNo : '',
      fullName: typeof fullName === 'string' ? fullName : '',
      roles: Array.isArray(roles) ? roles.map(String) : [],
      active: Boolean(active),
      createdAt: createdAt ? new Date(createdAt) : null,
    });

    // 👇 Parse danh sách xe nếu có
    if (Array.isArray(vehicles)) {
      user.vehicles = vehicles.map(v => new Vehicle(v));
    }

    return user;
  }
}
