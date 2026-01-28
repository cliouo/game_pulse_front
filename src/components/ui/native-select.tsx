import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export interface NativeSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface NativeSelectProps {
  value?: string
  onChange?: (value: string) => void
  options?: NativeSelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

const NativeSelect = React.forwardRef<HTMLDivElement, NativeSelectProps>(
  ({ value, onChange, options, placeholder = "请选择", disabled, className, children }, ref) => {
    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // 从 children 中提取 options
    const derivedOptions = React.useMemo<NativeSelectOption[]>(() => {
      if (options) return options
      const opts: NativeSelectOption[] = []
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === "option") {
          const props = child.props as React.OptionHTMLAttributes<HTMLOptionElement>
          if (props.value !== "" && props.value !== undefined) {
            opts.push({
              value: String(props.value),
              label: String(props.children || props.value),
              disabled: props.disabled,
            })
          }
        }
      })
      return opts
    }, [options, children])

    const selectedOption = derivedOptions.find((opt) => opt.value === value)
    const displayText = selectedOption?.label || placeholder

    // 点击外部关闭
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }
      if (open) {
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [open])

    // 键盘导航
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        setOpen(!open)
      } else if (event.key === "Escape") {
        setOpen(false)
      } else if (event.key === "ArrowDown" && open) {
        event.preventDefault()
        const currentIndex = derivedOptions.findIndex((opt) => opt.value === value)
        const nextIndex = currentIndex < derivedOptions.length - 1 ? currentIndex + 1 : 0
        const nextOption = derivedOptions[nextIndex]
        if (nextOption && !nextOption.disabled) {
          onChange?.(nextOption.value)
        }
      } else if (event.key === "ArrowUp" && open) {
        event.preventDefault()
        const currentIndex = derivedOptions.findIndex((opt) => opt.value === value)
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : derivedOptions.length - 1
        const prevOption = derivedOptions[prevIndex]
        if (prevOption && !prevOption.disabled) {
          onChange?.(prevOption.value)
        }
      }
    }

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue)
      setOpen(false)
    }

    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        {/* Trigger */}
        <div
          ref={ref}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            disabled && "cursor-not-allowed opacity-50",
            !selectedOption && "text-muted-foreground",
            "cursor-pointer select-none"
          )}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className={cn(
            "h-4 w-4 shrink-0 opacity-50 transition-transform",
            open && "rotate-180"
          )} />
        </div>

        {/* Dropdown - 不使用 Portal */}
        {open && (
          <div
            role="listbox"
            className={cn(
              "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover p-1 shadow-md",
              "animate-in fade-in-0 zoom-in-95"
            )}
          >
            {derivedOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                无可选项
              </div>
            ) : (
              derivedOptions.map((option) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    option.disabled && "pointer-events-none opacity-50"
                  )}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.value === value && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )
  }
)
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
