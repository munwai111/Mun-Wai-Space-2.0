// Entry for the standalone case-study pages. Each page's HTML names its record
// on the root element, so one bundle serves every case URL.
import React from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import CaseStudy from "./CaseStudy";
import { cases } from "./cases";
import "./styles.css";

const mount = document.getElementById("root");
const record = cases[mount.dataset.case];

if (record) {
  createRoot(mount).render(
    <React.StrictMode>
      <MotionConfig reducedMotion="user">
        <CaseStudy record={record} />
      </MotionConfig>
    </React.StrictMode>,
  );
}
