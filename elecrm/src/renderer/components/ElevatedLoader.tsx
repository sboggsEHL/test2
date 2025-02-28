import React from "react";
import "../styles/common.css";

interface ElevatedLoaderProps {
  width?: string;
  height?: string;
}

const ElevatedLoader: React.FC<ElevatedLoaderProps> = ({
  width = "100px",
  height = "100px",
}) => {
  return (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 1250.2 247.7"
      width={width}
      height={height}
      xmlSpace="preserve"
    >
      <style type="text/css">
        {`
          .st0 { fill: none; stroke: #FF9933; stroke-miterlimit: 10; stroke-width: 5; }
          .st1 { fill: none; stroke: #3399FF; stroke-miterlimit: 10; stroke-width: 5; }

          /* Animation for the orange stroke to brighten smoothly */
          .animate-orange {
            animation: brightenOrange 5s ease-in-out infinite;
          }

          /* Animation for the blue stroke to brighten smoothly */
          .animate-blue {
            animation: brightenBlue 5s ease-in-out infinite;
          }

          @keyframes brightenOrange {
            0%, 50% {
              stroke-opacity: 0;
            }
            25%, 75% {
              stroke-opacity: 1;
            }
            100% {
              stroke-opacity: 0;
            }
          }

          @keyframes brightenBlue {
            0%, 50% {
              stroke-opacity: 1;
            }
            25%, 75% {
              stroke-opacity: 0;
            }
            100% {
              stroke-opacity: 1;
            }
          }
        `}
      </style>

      {/* Orange Path Animation */}
      <path
        className="st0 animate-orange"
        d="M1249.1,139.3c0,18.8-3.1,34.9-9.2,48.4c-6.1,13.5-14.6,24.7-25.3,33.6c-10.8,8.9-23.4,15.4-38,19.7
        s-30.2,6.4-46.8,6.4l-61.3,0l0.2-216.4l61.3,0c16.7,0,32.3,2.1,46.8,6.3c14.5,4.2,27.2,10.7,38,19.6c10.8,8.9,19.2,20.1,25.3,33.8
        C1246.1,104.4,1249.1,120.6,1249.1,139.3z M1075.3,37.1l-0.2,204.1l53,0c15.9,0,30.9-2,44.9-5.9c14-4,26.1-10.1,36.3-18.3
        c10.2-8.2,18.3-18.8,24.2-31.6c5.9-12.8,8.9-28.2,8.9-46.1c0-17.9-2.9-33.4-8.8-46.3c-5.9-12.9-14-23.5-24.2-31.8
        c-10.2-8.3-22.3-14.3-36.3-18.2c-14-3.9-28.9-5.8-44.8-5.9L1075.3,37.1z"
      />

      <polygon
        className="st0 animate-orange"
        points="669.1,31.3 658.8,31.3 578.3,241.7 0.8,241.2 0.8,247.1 582.9,247.6 582.9,247.6 583.4,247.6 
        663.6,37.4 664.2,37.4 742.9,247.7 750.2,247.7 "
      />

      <polygon
        className="st0 animate-orange"
        points="1042.9,31 891.7,30.8 891.7,30.8 737.7,30.7 737.7,36.8 811.3,36.9 811.1,247.1 817.8,247.1 818,36.9 
        891.7,36.9 891.7,36.9 1042.9,37.1 "
      />

      <rect
        x="916.8"
        y="132.5"
        className="st0 animate-orange"
        width="126.1"
        height="5.9"
      />
      <rect
        x="916.7"
        y="240.7"
        className="st0 animate-orange"
        width="126.1"
        height="5.9"
      />

      {/* Blue Path Animation */}
      <rect
        x="304"
        y="1"
        className="st1 animate-blue"
        width="126"
        height="5.9"
      />
      <rect
        x="304"
        y="102.3"
        className="st1 animate-blue"
        width="126"
        height="5.9"
      />
      <polygon
        className="st1 animate-blue"
        points="290,210.4 290,210.3 182.4,210.2 182.6,0 175.9,0 175.7,216.4 283.7,216.5 283.7,216.5 429.9,216.6 
        429.9,210.5 "
      />
      <polygon
        className="st1 animate-blue"
        points="131.8,6.6 131.8,0.7 5.8,0.6 5.6,215.9 5.6,215.9 5.6,216.1 131.6,216.2 131.7,210.3 11.5,210.2 
        11.6,107.9 131.7,108 131.7,102.1 11.6,102 11.7,6.5 "
      />
      <polygon
        className="st1 animate-blue"
        points="1250.2,0.9 628.5,0.4 628.5,0.4 626.7,0.4 546.4,210.6 545.8,210.6 467.2,0.2 459.8,0.2 540.9,216.7 
        551.3,216.7 631.8,6.3 1250.2,6.9 "
      />
    </svg>
  );
};

export default ElevatedLoader;
