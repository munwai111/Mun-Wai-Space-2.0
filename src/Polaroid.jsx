import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useSpring } from "motion/react";

export default function Polaroid({ world, image, photo, calm, floating }) {
  const surface = useRef(null);
  const bounds = useRef(null);
  const rotateX = useSpring(0, { stiffness: 110, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 110, damping: 18 });
  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };
  useEffect(() => {
    rotateX.jump(0);
    rotateY.jump(0);
  }, [image, calm, rotateX, rotateY]);
  const move = (event) => {
    if (calm || event.pointerType !== "mouse" || !bounds.current) return;
    const box = bounds.current;
    const x = Math.max(
      -0.5,
      Math.min(0.5, (event.clientX - box.left) / box.width - 0.5),
    );
    const y = Math.max(
      -0.5,
      Math.min(0.5, (event.clientY - box.top) / box.height - 0.5),
    );
    rotateX.set(-y * 15);
    rotateY.set(x * 18);
  };
  return (
    <div
      className="polaroid-scene"
      data-floating={floating}
      ref={surface}
      onPointerEnter={() => {
        bounds.current = surface.current.getBoundingClientRect();
      }}
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <span className="polaroid-archive-label">A MOMENT FROM THE ARCHIVE</span>
      <div className="polaroid-float">
        <motion.div className="polaroid-tilt" style={{ rotateX, rotateY }}>
          <AnimatePresence initial={false} mode="sync">
            <motion.figure
              key={image || world.name}
              className="polaroid-print"
              initial={
                calm
                  ? false
                  : {
                      opacity: 0,
                      x: 38,
                      y: 24,
                      rotate: 7,
                      scale: 0.92,
                      filter: "blur(5px)",
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                rotate: photo % 2 ? 2 : -2,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                x: calm ? 0 : -32,
                y: calm ? 0 : -18,
                rotate: calm ? 0 : -7,
                scale: calm ? 1 : 1.035,
                filter: calm ? "blur(0px)" : "blur(4px)",
              }}
              transition={{
                duration: calm ? 0 : 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt={`${world.alt}, photograph ${photo + 1}`}
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="600"
                />
              ) : (
                <div className="polaroid-concept">
                  <small>QUESTION / LISTEN / NOTICE</small>
                  <strong>
                    What happened
                    <br />
                    in the room?
                  </strong>
                  <span>
                    Who was heard?
                    <br />
                    What should change next?
                  </span>
                </div>
              )}
              <figcaption>
                <span>{world.visualNote || "YAKBIT / INDUSTRY PROJECT"}</span>
                <strong>
                  {world.visualDetail || "HUMAN SIGNALS · CONCEPT NOTES"}
                </strong>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </motion.div>
      </div>
      <span className="polaroid-hint">
        {image
          ? "A small window into a bigger chapter."
          : "An illustrated reflection on the work."}
      </span>
    </div>
  );
}
