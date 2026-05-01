"use client";

import "./landingpage.css";
import { LandingGalleryItem } from "@/lib/landing";

import { motion } from "framer-motion";

type Props = {
  galleryItems: LandingGalleryItem[];
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function GallerySection({ galleryItems }: Props) {
  return (
    <section className="section-shell plain">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* <div className="section-label">
            <span className="section-label-dot" />
            Family Gallery
          </div> */}
          <h2 className="section-heading">
            Moments worth <span className="grad">remembering</span>
          </h2>
          <p className="section-sub">
            Capture milestones, adventures, and everyday magic — all in one
            beautiful family gallery.
          </p>
        </motion.div>

        {galleryItems.length === 0 ? (
          <p className="empty-state">No gallery moments yet.</p>
        ) : (
          <motion.div
            className="gallery-grid"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {galleryItems.map((gi) => (
              <motion.article
                key={gi.id}
                className="gallery-card"
                variants={item}
              >
                <div
                  className="gallery-icon-wrap"
                  style={{ background: gi.color_token }}
                >
                  {gi.icon}
                </div>
                <div className="gallery-title">{gi.title}</div>
                <div className="gallery-meta">{gi.subtitle}</div>
                <div className="gallery-badge">{gi.sort_order}</div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
