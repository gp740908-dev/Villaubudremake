import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Clock, Plane, Car } from "lucide-react";

const attractions = [
  { name: "Tegallalang Rice Terrace", distance: "5 min", icon: MapPin },
  { name: "Ubud Monkey Forest", distance: "10 min", icon: MapPin },
  { name: "Tirta Empul Temple", distance: "15 min", icon: MapPin },
  { name: "Ubud Royal Palace", distance: "8 min", icon: MapPin },
  { name: "Campuhan Ridge Walk", distance: "12 min", icon: MapPin },
  { name: "Goa Gajah Temple", distance: "20 min", icon: MapPin },
];

const transportation = [
  { 
    title: "From Ngurah Rai Airport", 
    duration: "1h 30min", 
    description: "Private airport transfer included",
    icon: Plane 
  },
  { 
    title: "From Seminyak", 
    duration: "1h", 
    description: "Scenic route through villages",
    icon: Car 
  },
];

const LocationSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="location" className="section-padding bg-secondary/20" ref={sectionRef}>
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary uppercase tracking-widest text-sm font-medium mb-4 block">
            Location
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-foreground mb-6">
            Perfectly Positioned in Ubud
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our villas are located in the heart of Ubud, giving you easy access
            to the best attractions, restaurants, and cultural experiences.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative rounded-2xl overflow-hidden shadow-elevated h-[400px] lg:h-[500px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31569.07467959747!2d115.2444508!3d-8.5068487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23d739f22c9c3%3A0x54a38afd6bf5c0af!2sUbud%2C%20Gianyar%20Regency%2C%20Bali%2C%20Indonesia!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubud Location Map"
              className="grayscale-[30%] contrast-[1.1]"
            />
            
            {/* Map Overlay Card */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-72 glass-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">StayinUBUD Villas</p>
                  <p className="text-sm text-muted-foreground">Ubud, Gianyar, Bali</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Attractions & Transportation */}
          <div className="space-y-8">
            {/* Nearby Attractions */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
                Nearby Attractions
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {attractions.map((attraction, index) => (
                  <motion.div
                    key={attraction.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <attraction.icon size={18} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {attraction.name}
                      </p>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Clock size={12} />
                        <span>{attraction.distance}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Transportation */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
                Getting Here
              </h3>
              <div className="space-y-4">
                {transportation.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4 p-5 bg-background rounded-xl border border-border"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <item.icon size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-primary font-medium">{item.duration}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
