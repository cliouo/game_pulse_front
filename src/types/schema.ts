import type { JSONSchema7 } from 'json-schema';

export interface ExtendedJSONSchema extends JSONSchema7 {
  'x-order'?: number;
  'x-group'?: string;
  'x-groups'?: Record<string, GroupConfig>;
  'x-widget'?: string;
  'x-dependsOn'?: Record<string, unknown>;
  'x-placeholder'?: string;
  'x-help'?: string;
  'x-collapsed'?: boolean;
  'x-disabled'?: boolean;
  'x-hidden'?: boolean;
  'x-enumLabels'?: string[];
  'x-step'?: number;
}

export interface UISchema {
  'ui:order'?: string[];
  'ui:widget'?: string;
  [key: string]: UISchema | string | string[] | undefined;
}

export interface GroupConfig {
  title: string;
  order?: number;
  columns?: number;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface SchemaFormProps {
  schema: ExtendedJSONSchema;
  uiSchema?: UISchema;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onSubmit?: (value: Record<string, unknown>) => void;
  liveValidate?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface FieldProps {
  name: string;
  schema: ExtendedJSONSchema;
  uiSchema?: UISchema;
  value: unknown;
  onChange: (value: unknown) => void;
  errors?: string[];
  disabled?: boolean;
  path?: string;
}

export interface TaskTypeWithSchema {
  value: string;
  label: string;
  description: string;
  schema: ExtendedJSONSchema;
  ui_schema: UISchema;
}
