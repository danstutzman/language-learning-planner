import Db from './Db'

export interface Upload {
  id?: number
  type: string
  logJson?: string
  createdAtMillis: number
}

export interface UploadsProps {
  deleteUploads: (ids: Array<number>) => Promise<void>
  log: (message: string, details?: {}) => void
  listUploads: () => Promise<Array<Upload>>
}

export default class UploadsStorage {
  props: UploadsProps
  db: Db

  constructor(db: Db) {
    this.props = {
      deleteUploads: this.deleteUploads,
      listUploads: this.listUploads,
      log: this.log,
    }
    this.db = db
  }

  deleteUploads = (ids: Array<number>): Promise<void> => {
    if (ids.length > 0) {
      return this.db.uploads
        .where('id')
        .between(Math.min(...ids), Math.max(...ids), true, true)
        .delete()
        .then(() => {})
    } else {
      return Promise.resolve()
    }
  }

  listUploads = (): Promise<Array<Upload>> =>
    this.db.uploads.toArray()

  log = (message: string, details?: {}) => {
    const log: any = details ? { ...details, message } : { message }
    if (details && (details as any).error) {
      const { name, message, stack } = (details as any).error
      log.error = { name, message, stack }
    }

    this.db.uploads.put({
      type: 'log',
      logJson: JSON.stringify(log),
      createdAtMillis: new Date().getTime(),
    })
  }
}