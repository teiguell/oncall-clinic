// Map component — stylized Ibiza-ish SVG map (original, not mimicking any brand)
// Animated doctor pin moving along a route toward a patient pin.

const MapView = ({ progress = 0.4, mini = false, height = 520 }) => {
  // Route waypoints — a curvy path across the map
  const routeD = "M 70 440 C 90 380, 130 340, 160 310 S 220 240, 250 200 S 310 140, 340 90";
  // Parametric approx points along the curve (sampled)
  const routePoints = [
    [70, 440], [80, 410], [95, 385], [115, 360], [135, 335],
    [160, 310], [185, 280], [210, 250], [235, 220], [250, 200],
    [275, 175], [300, 150], [325, 120], [340, 90]
  ];
  const idx = Math.min(routePoints.length - 1, Math.floor(progress * (routePoints.length - 1)));
  const nextIdx = Math.min(routePoints.length - 1, idx + 1);
  const segT = progress * (routePoints.length - 1) - idx;
  const [x1, y1] = routePoints[idx];
  const [x2, y2] = routePoints[nextIdx];
  const doctorX = x1 + (x2 - x1) * segT;
  const doctorY = y1 + (y2 - y1) * segT;

  return (
    <div style={{
      position: "relative", width: "100%", height,
      background: "#E6EFF4", overflow: "hidden",
    }}>
      {/* Map SVG — coastline, roads, landmarks */}
      <svg width="100%" height="100%" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice"
           style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#DCE8EF"/>
            <stop offset="1" stopColor="#C9DDE6"/>
          </linearGradient>
          <pattern id="waves" width="30" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10 Q 7.5 4, 15 10 T 30 10" stroke="#B8CDD6" strokeWidth="0.5" fill="none" opacity="0.5"/>
          </pattern>
        </defs>
        {/* sea */}
        <rect width="400" height="520" fill="url(#sea)"/>
        <rect width="400" height="520" fill="url(#waves)"/>

        {/* Landmass — organic blobby island shape */}
        <path d="M -20 420 C 40 380, 30 340, 80 310 C 120 285, 110 250, 160 230
                 C 210 210, 220 160, 270 140 C 320 120, 350 80, 400 70
                 L 420 -20 L -20 -20 Z"
              fill="#F2EFE9"/>
        <path d="M 50 500 C 80 470, 130 460, 180 470 C 240 480, 300 470, 360 490
                 L 420 540 L -20 540 Z"
              fill="#F2EFE9"/>

        {/* parks / green */}
        <path d="M 180 260 C 210 250, 240 260, 250 290 C 260 320, 230 340, 200 330 C 175 322, 170 280, 180 260 Z"
              fill="#D9E4C8" opacity="0.85"/>
        <path d="M 60 130 C 90 120, 130 130, 140 160 C 148 185, 120 200, 90 195 C 65 190, 50 155, 60 130 Z"
              fill="#D9E4C8" opacity="0.85"/>

        {/* roads */}
        <g stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round">
          <path d="M 0 430 L 200 380 L 280 340 L 400 310"/>
          <path d="M 60 500 L 100 380 L 140 280 L 200 180 L 260 100 L 320 40"/>
          <path d="M 40 300 L 180 260 L 300 220"/>
          <path d="M 140 480 L 200 380 L 260 320"/>
        </g>
        <g stroke="#E8E2D5" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M 0 430 L 200 380 L 280 340 L 400 310"/>
          <path d="M 60 500 L 100 380 L 140 280 L 200 180 L 260 100 L 320 40"/>
          <path d="M 40 300 L 180 260 L 300 220"/>
          <path d="M 140 480 L 200 380 L 260 320"/>
        </g>

        {/* buildings — small rectangles */}
        {[[95,350,14,18],[115,355,10,12],[150,320,12,16],[175,300,10,14],
          [215,260,12,14],[245,230,10,16],[280,195,14,12],[310,165,12,14],
          [70,430,12,14],[110,420,10,12],[140,400,14,16],[170,385,12,10]].map(([x,y,w,h],i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="#E3DCCC" stroke="#CFC8B8" strokeWidth="0.5" rx="1"/>
        ))}

        {/* Labels */}
        <text x="100" y="165" fontSize="9" fill="#8B8577" fontFamily="Inter" letterSpacing="1">DALT VILA</text>
        <text x="210" y="295" fontSize="8" fill="#8B8577" fontFamily="Inter" letterSpacing="0.5">PARC NATURAL</text>
        <text x="300" y="180" fontSize="9" fill="#8B8577" fontFamily="Inter" letterSpacing="1">TALAMANCA</text>

        {/* Route — dashed trail behind doctor */}
        <path d={routeD} stroke="#C8D5DC" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 6"/>
        {/* Route — solid traveled portion */}
        <path d={routeD} stroke="#3B82F6" strokeWidth="4" fill="none" strokeLinecap="round"
              strokeDasharray={`${progress * 500} 500`} style={{ transition: "stroke-dasharray 0.8s ease" }}/>

        {/* Patient pin (destination) */}
        <g transform="translate(340, 90)">
          <circle r="22" fill="#3B82F6" opacity="0.12"/>
          <circle r="14" fill="#3B82F6" opacity="0.2"/>
          <path d="M 0 -16 C -9 -16, -14 -10, -14 -2 C -14 7, 0 16, 0 16 C 0 16, 14 7, 14 -2 C 14 -10, 9 -16, 0 -16 Z"
                fill="#1E40AF" stroke="#fff" strokeWidth="2"/>
          <circle cx="0" cy="-4" r="4" fill="#fff"/>
        </g>
      </svg>

      {/* Doctor pin — HTML-positioned with animated pulse */}
      <div style={{
        position: "absolute",
        left: `${(doctorX / 400) * 100}%`,
        top: `${(doctorY / 520) * 100}%`,
        transform: "translate(-50%, -50%)",
        transition: "left 0.8s ease, top 0.8s ease",
        zIndex: 5,
      }}>
        <div style={{ position: "relative", width: 44, height: 44 }}>
          {/* pulse ring */}
          <div style={{
            position: "absolute", inset: -8, borderRadius: "50%",
            background: "#3B82F6", opacity: 0.25,
            animation: "mapPulse 2s ease-out infinite",
          }}/>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "#fff", padding: 3,
            boxShadow: "0 4px 12px rgba(59,130,246,0.45)",
          }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: "linear-gradient(135deg, #FDE68A, #D97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 600, fontSize: 14,
              fontFamily: "Inter",
            }}>MG</div>
          </div>
          {/* direction indicator */}
          <div style={{
            position: "absolute", bottom: -4, right: -4,
            width: 18, height: 18, borderRadius: "50%",
            background: "#3B82F6", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          }}>
            <IconNav size={10} stroke="#fff" strokeWidth={2.5}/>
          </div>
        </div>
      </div>

      {/* Map attribution — tiny corner note */}
      {!mini && (
        <div style={{
          position: "absolute", bottom: 8, right: 10,
          fontSize: 9, color: "#8B8577", fontFamily: "Inter",
          letterSpacing: 0.3,
        }}>IBIZA · ILLES BALEARS</div>
      )}
    </div>
  );
};

window.MapView = MapView;
