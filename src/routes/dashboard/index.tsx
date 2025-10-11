import { useState, useEffect } from "react";

import { Col, Row } from "antd";

import { mockDashboardTotalCounts } from "@/providers/data/dashboard-mock-data";

import {
  CalendarUpcomingEvents,
  DashboardDealsChart,
  DashboardLatestActivities,
  DashboardTotalCountCard,
} from "./components";

export const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(mockDashboardTotalCounts);

  useEffect(() => {
    // Simulate API call - Replace this with actual REST API call later
    // Example: fetch(`${API_URL}/dashboard/total-counts`)
    const timer = setTimeout(() => {
      setData(mockDashboardTotalCounts);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={24} xl={8}>
          <DashboardTotalCountCard
            resource="companies"
            isLoading={isLoading}
            totalCount={data?.companies?.totalCount ?? 0}
          />
        </Col>
        <Col xs={24} sm={24} xl={8}>
          <DashboardTotalCountCard
            resource="contacts"
            isLoading={isLoading}
            totalCount={data?.contacts?.totalCount ?? 0}
          />
        </Col>
        <Col xs={24} sm={24} xl={8}>
          <DashboardTotalCountCard
            resource="deals"
            isLoading={isLoading}
            totalCount={data?.deals?.totalCount ?? 0}
          />
        </Col>
      </Row>

      <Row
        gutter={[32, 32]}
        style={{
          marginTop: "32px",
        }}
      >
        <Col
          xs={24}
          sm={24}
          xl={8}
          style={{
            height: "460px",
          }}
        >
          <CalendarUpcomingEvents />
        </Col>
        <Col
          xs={24}
          sm={24}
          xl={16}
          style={{
            height: "460px",
          }}
        >
          <DashboardDealsChart />
        </Col>
      </Row>

      <Row
        gutter={[32, 32]}
        style={{
          marginTop: "32px",
        }}
      >
        <Col xs={24}>
          <DashboardLatestActivities />
        </Col>
      </Row>
    </div>
  );
};
