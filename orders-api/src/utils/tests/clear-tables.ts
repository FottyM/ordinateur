import { DataSource } from 'typeorm';

export async function clearTables(
  dataSource: DataSource,
  tables: string[] = [],
) {
  if (tables.length) {
    for (const table of tables) {
      const repository = dataSource.getRepository(table);
      await repository.clear();
    }
    return;
  }

  for (const entity of dataSource.entityMetadatas) {
    const repository = dataSource.getRepository(entity.name);
    await repository.clear();
  }
}
