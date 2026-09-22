import { motion, useScroll } from "motion/react";

export default function PageThread() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.span
      className="reading-progress"
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  );
}
