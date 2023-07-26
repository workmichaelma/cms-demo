import { atom, useAtom } from 'jotai'

export const username = atom('')
export const pageType = atom(null)
export const isEditPage = atom((get) => get(pageType) === 'edit')
export const isNewPage = atom((get) => get(pageType) === 'new')
export const isCopyPage = atom((get) => get(pageType) === 'copy')
export const isListingPage = atom((get) => get(pageType) === 'listing')
export const topBar = atom({
  url: '/',
  title: '',
  createable: false,
  copyable: false,
  canSave: false,
  save: null,
})
export const sideBar = atom({
  open: true,
  activeItem: [],
})
export const alert = atom({
  message: '',
  type: '',
  timeout: 5000,
})
