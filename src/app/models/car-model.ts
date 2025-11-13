export class CarModel {
  id: number = 0;
  modelName: string = '';
  carType: string = '';

  constructor(init?: Partial<CarModel>) {
    Object.assign(this, init);
  }

  static fromJSON(jsonStr: string): CarModel {
    let obj: unknown;
    try {
      obj = JSON.parse(jsonStr);
    } catch {
      throw new Error('Invalid JSON');
    }
    const { id, modelName, carType } = (obj as any) ?? {};
    return new CarModel({
      id: typeof id === 'number' ? id : 0,
      modelName: typeof modelName === 'string' ? modelName : '',
      carType: typeof carType === 'string' ? carType : '',
    });
  }

  get carName(): string {
    return this.modelName;
  }

  set carName(value: string) {
    this.modelName = value;
  }
}
