import './Example.css';
import { useEffect, useState } from 'react';
import { makeElectricContext } from 'electric-sql/react';
import { randomValue, uniqueTabId } from 'electric-sql/util';
import { LIB_VERSION } from 'electric-sql/version';
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite';
import { createStore } from 'tinybase';
import { createElectricSqlPersister } from 'tinybase/persisters/persister-electric-sql';
import {
  Provider,
  useAddRowCallback,
  useCreatePersister,
  useCreateStore,
  useDelTableCallback,
} from 'tinybase/ui-react';
import { TableInHtmlTable } from 'tinybase/ui-react-dom';
import { authToken } from './auth';
import { Electric, schema } from './generated/client';

const { ElectricProvider, useElectric } = makeElectricContext<Electric>()

export const Example = () => {
  const [ electric, setElectric ] = useState<Electric>()

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const config = {
        auth: {
          token: authToken()
        },
        debug: import.meta.env.DEV,
        url: import.meta.env.ELECTRIC_SERVICE
      }

      const { tabId } = uniqueTabId()
      const scopedDbName = `basic-${LIB_VERSION}-${tabId}.db`

      const conn = await ElectricDatabase.init(scopedDbName)
      const electric = await electrify(conn, schema, config)

      if (!isMounted) {
        return
      }

      setElectric(electric)
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  const store = useCreateStore(createStore);
  useCreatePersister(
    store,
    (store) =>
      electric
        ? createElectricSqlPersister(store, electric, {
            mode: 'tabular',
            tables: {
              load: { items: { tableId: 'items', rowIdColumnName: 'id' } },
              save: { items: { tableName: 'items', rowIdColumnName: 'id' } },
            },
          })
        : undefined,
    [electric],
    async (persister) => {
      await persister?.startAutoLoad();
      await persister?.startAutoSave();
    }
  );

  if (electric === undefined) {
    return null
  }

  return (
    <ElectricProvider db={electric}>
      <Provider store={store}>
        <ExampleComponent />
      </Provider>
    </ElectricProvider>
  )
}

const ExampleComponent = () => {
  const { db } = useElectric()!

  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const shape = await db.items.sync()

      // Resolves when the data has been synced into the local database.
      await shape.synced
    }

    syncItems()
  }, [db.items])

  const addItem = useAddRowCallback('items', () => ({
    text1: randomValue(), 
    text2: randomValue(),
  }))

  const clearItems = useDelTableCallback('items');

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={ addItem }>
          Add
        </button>
        <button className="button" onClick={ clearItems }>
          Clear
        </button>
      </div>
      <TableInHtmlTable
        tableId='items'
        editable={true}
        idColumn={false}
        headerRow={false}
      />
    </div>
  )
}
