import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import riceTerrace from "@/assets/rice-terrace.jpg";
import temple from "@/assets/temple.jpg";
import culture from "@/assets/culture.jpg";
import { stats, experiences } from "@/data/villas";

const AnimatedCounter = ({ value, suffix = "", duration = 2000 }: { value: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
};

const ExperienceSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="section-padding bg-secondary/30" ref={sectionRef}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Image Collage */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative z-10"
              >
                <img
                  src={riceTerrace}
                  alt="Ubud Rice Terraces"
                  className="w-full max-w-md rounded-2xl shadow-elevated"
                />
              </motion.div>

              {/* Overlapping Image 1 */}
              <motion.div
                initial={{ opacity: 0, x: 30, y: -30 }}
                animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -right-4 lg:-right-12 top-20 z-20"
              >
                <img
                  src={temple}
                  alt="Balinese Temple"
                  className="w-32 lg:w-48 h-40 lg:h-56 object-cover rounded-xl shadow-lg border-4 border-background"
                />
              </motion.div>

              {/* Overlapping Image 2 */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 30 }}
                animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -left-4 lg:-left-8 -bottom-8 z-20"
              >
                <img
                  src={culture}
                  alt="Balinese Culture"
                  className="w-36 lg:w-52 h-44 lg:h-64 object-cover rounded-xl shadow-lg border-4 border-background"
                />
              </motion.div>

              {/* Decorative Element */}
              <div className="absolute -z-10 top-8 left-8 w-full h-full bg-primary/20 rounded-2xl" />
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-primary uppercase tracking-widest text-sm font-medium mb-4 block">
              The Ubud Experience
            </span>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-foreground mb-6">
              Immerse Yourself in
              <br />
              <span className="italic">Balinese Beauty</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Ubud is the cultural heart of Bali, where ancient traditions meet
              lush natural landscapes. From our villas, you're perfectly positioned
              to explore everything this magical destination has to offer.
            </p>

            {/* Experience List */}
            <div className="space-y-6 mb-10">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-foreground mb-1">
                      {exp.title}
                    </h4>
                    <p className="text-muted-foreground">{exp.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-border">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl lg:text-4xl font-bold text-primary mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
