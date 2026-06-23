import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

type Themes = { light: string; dark: string };

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Record<keyof Themes, string>;
  }
>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ className, children, config, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn(
          "flex justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-polar-grid_angle-line]:stroke-border",
          "[&_.recharts-radial-bar-background_sector]:fill-muted",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/40",
          "[&_.recharts-reference-line_line]:stroke-border",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    (entry): entry is [string, ChartConfig[string]] => {
      const [, c] = entry;
      return Boolean(c.theme || c.color);
    }
  );

  if (!colorConfig.length) {
    return null;
  }

  const styleSerializer = (config: ChartConfig[string], key: string) => {
    const { color, theme } = config;
    const CSS_VAR_PREFIX = "--color-";
    if (color) {
      return `${CSS_VAR_PREFIX}${key}: ${color};`;
    }
    if (theme) {
      return Object.entries(theme)
        .map(([mode, color]) => `${CSS_VAR_PREFIX}${key}-${mode}: ${color};`)
        .join(" ");
    }
    return "";
  };

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: colorConfig
          .map(([key, c]: [string, ChartConfig[string]]) => `#${id} { ${styleSerializer(c, key)} }`)
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

interface ChartTooltipPayloadItem {
  name?: string | number;
  dataKey?: string | number;
  value?: number | string | Array<number | string>;
  color?: string;
  payload?: Record<string, unknown>;
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean;
    payload?: ChartTooltipPayloadItem[];
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    label?: React.ReactNode;
    labelFormatter?: (value: React.ReactNode, payload: ChartTooltipPayloadItem[]) => React.ReactNode;
    labelClassName?: string;
    formatter?: (value: number | string, name: string, item: ChartTooltipPayloadItem, index: number, payload: Record<string, unknown>) => React.ReactNode;
    color?: string;
  }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label]?.label || label
          : itemConfig?.label;

      if (labelFormatter && payload) {
        return (
          <div className={cn("font-mono font-medium text-foreground", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-mono font-medium text-foreground", labelClassName)}>{value}</div>;
    }, [
      hideLabel,
      label,
      labelFormatter,
      payload,
      labelClassName,
      labelKey,
      config,
    ]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover/95 p-3 text-xs shadow-xl backdrop-blur",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || (item.payload?.fill as string) || item.color;

            return (
              <div
                key={String(item.dataKey)}
                className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(
                    Array.isArray(item.value) ? item.value.join(", ") : item.value,
                    String(item.name),
                    item,
                    index,
                    item.payload || {}
                  )
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px]",
                            indicator === "dot" && "h-2.5 w-2.5",
                            indicator === "line" && "w-1",
                            indicator === "dashed" && "w-0 border-[1.5px] border-dashed bg-transparent",
                            nestLabel && indicator === "dashed" && "my-0.5"
                          )}
                          style={
                            {
                              backgroundColor: indicatorColor,
                              borderColor: indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value !== undefined && (
                        <span className="font-mono-tabular font-medium text-foreground">
                          {item.value}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendPayloadItem {
  value?: string | number;
  dataKey?: string | number;
  color?: string;
}

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<"div">, "payload"> & {
    payload?: ChartLegendPayloadItem[];
    verticalAlign?: "top" | "middle" | "bottom";
    hideIcon?: boolean;
    nameKey?: string;
  }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={String(item.value)}
              className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
): ChartConfig[string] | undefined {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const p = payload as Record<string, unknown>;
  const payloadPayload =
    typeof p.payload === "object" && p.payload !== null
      ? (p.payload as Record<string, unknown>)
      : undefined;

  let configLabelKey: string = key;

  if (key in p && typeof p[key] === "string") {
    configLabelKey = p[key] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
