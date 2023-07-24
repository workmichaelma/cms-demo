import { atom, useAtom } from 'jotai'

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
  saveable: false,
})
export const sideBar = atom({
  open: true,
  activeItem: ['DATABASE', 'contract'],
})
