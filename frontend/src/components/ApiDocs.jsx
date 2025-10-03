import React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocs() {
  return (
    <div className="h-screen">
      <SwaggerUI url="/openapi.yaml" />
    </div>
  );
}
