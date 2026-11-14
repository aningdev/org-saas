import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { cn } from "@/lib/cn";

type TableProps = JSX.HTMLAttributes<HTMLTableElement>;

function Table(props: TableProps) {
  const rest = omit(props, "class");
  return (
    <div data-slot="table-container" class="relative w-full overflow-x-auto">
      <table data-slot="table" class={cn("w-full caption-bottom text-sm", props.class)} {...rest} />
    </div>
  );
}

type TheadProps = JSX.HTMLAttributes<HTMLTableSectionElement>;

function TableHeader(props: TheadProps) {
  const rest = omit(props, "class");
  return <thead data-slot="table-header" class={cn("[&_tr]:border-b", props.class)} {...rest} />;
}

function TableBody(props: TheadProps) {
  const rest = omit(props, "class");
  return (
    <tbody data-slot="table-body" class={cn("[&_tr:last-child]:border-0", props.class)} {...rest} />
  );
}

type TrProps = JSX.HTMLAttributes<HTMLTableRowElement>;

function TableRow(props: TrProps) {
  const rest = omit(props, "class");
  return (
    <tr
      data-slot="table-row"
      class={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        props.class,
      )}
      {...rest}
    />
  );
}

type ThProps = JSX.ThHTMLAttributes<HTMLTableCellElement>;

function TableHead(props: ThProps) {
  const rest = omit(props, "class");
  return (
    <th
      data-slot="table-head"
      class={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        props.class,
      )}
      {...rest}
    />
  );
}

type TdProps = JSX.TdHTMLAttributes<HTMLTableCellElement>;

function TableCell(props: TdProps) {
  const rest = omit(props, "class");
  return (
    <td
      data-slot="table-cell"
      class={cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", props.class)}
      {...rest}
    />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
