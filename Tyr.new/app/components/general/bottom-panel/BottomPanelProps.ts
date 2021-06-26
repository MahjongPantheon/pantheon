export type BottomPanelProps = {
  text?: string
  showBack?: boolean
  showNext?: boolean
  isNextDisabled?: boolean
  showSave?: boolean
  isSaveDisabled?: boolean
  showHome?: boolean
  showRefresh?: boolean
  showAdd?: boolean
  showLog?: boolean
} & BottomPanelPropsBase

export type BottomPanelPropsBase = {
  isNextDisabled?: boolean
  isSaveDisabled?: boolean
  onNextClick?: () => void
  onBackClick?: () => void
  onSaveClick?: () => void
  onLogClick?: () => void
  onAddClick?: () => void
  onHomeClick?: () => void
  onRefreshClick?: () => void
}
