import Store from 'electron-store'

type clientStoreType = {
  ui: uiStoreType
}
type uiStoreType = {
  sideBarOpen: boolean
  writingMode: 'vim' | 'normal'
  currentFilePath: string
  font: 'font-sans' | 'font-serif'
}
export const clientStore = new Store<uiStoreType>({
  defaults: {
    sideBarOpen: false,
    writingMode: 'normal',
    currentFilePath: '',
    font: 'font-sans'
  }
})
