import { Memento } from "vscode";

export class LocalStorageService {
  constructor(private storage: Memento) {}

  public getValue<T>(key: string): T {
    // @ts-ignore
    // to-do: weird typescript thing with generics
    return this.storage.get<T>(key, null);
  }

  public setValue<T>(key: string, value: T) {
    this.storage.update(key, value);
  }
}
