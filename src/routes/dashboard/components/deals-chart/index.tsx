import React, { useState, useEffect } from "react";

import { DollarOutlined } from "@ant-design/icons";
import { Area, Datum, type AreaConfig } from "@ant-design/plots";
import { Card } from "antd";

import { Text } from "@/components";
import { mockDealStages } from "@/providers/data/dashboard-mock-data";

import { mapDealsData } from "./utils";

export const DashboardDealsChart = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate API call - Replace this with actual REST API call later
    // Example: fetch(`${API_URL}/dashboard/deal-stages?filter=WON,LOST`)
    const timer = setTimeout(() => {
      setData(mockDealStages);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const dealData = React.useMemo(() => {
    return mapDealsData(data?.data);
  }, [data?.data]);

  const config: AreaConfig = {
    data: dealData,
    xField: "timeText",
    yField: "value",
    seriesField: "state",

    legend: {
      position: "top-left",
      offsetY: -6,
    },

    axis: {
      y: {
        tickCount: 4,
        label: {
          formatter: (v: number) => `$${v / 1000}k`,
        },
      },
    },

    tooltip: {
      shared: true,
      formatter: (datum: Datum) => ({
        name: datum.state,
        value: `$${datum.value / 1000}k`,
      }),
    },

    colorField: ({ state }: { state: string }) =>
      (state === "Won" ? "#52C41A" : "#F5222D"),

    line: {
      style: ({ state }: { state: string }) => ({
        stroke: state === "Won" ? "#52C41A" : "#F5222D",
        lineWidth: 1.5,
      }),
    },

    // If your version supports a nested `area` or `series` config, it might go here:
    area: {
      // e.g. shape: "smooth",
      // style: ({ state }: { state: string }) => ({ fill: ... }),
    },
  };

  return (
    <Card
      style={{ height: "100%" }}
      styles={{
        header: { padding: "8px 16px" },
        body: { padding: "24px 24px 0px 24px" }
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <DollarOutlined />
          <Text size="sm" style={{ marginLeft: ".5rem" }}>
            Deals
          </Text>
        </div>
      }
    >
      <Area {...config} height={325} />
    </Card>
  );
};
