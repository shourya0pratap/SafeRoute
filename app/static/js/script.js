document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Sticky Navbar ---
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.style.background = "rgba(15, 23, 42, 0.95)";
      navbar.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
    } else {
      navbar.style.background = "rgba(15, 23, 42, 0.9)";
      navbar.style.boxShadow = "none";
    }
  });

  // --- 2. Smooth Scrolling for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // Scroll to the element with a slight offset for the fixed header
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // --- 3. Active Link Highlighter on Scroll ---
  const sections = document.querySelectorAll("section, header");
  const navLinks = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      // If we have scrolled 1/3rd into the section
      if (pageYOffset >= sectionTop - sectionHeight / 3) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").includes(current)) {
        link.classList.add("active");
      }
    });
  });
});

async function geocodeAndRoute() {
  let startText = document.getElementById("start-location").value;
  let endText = document.getElementById("end-location").value;

  document.getElementById("route-stats").innerHTML =
    "Calculating coordinates...";

  try {
    // Fetch coordinates for Origin
    let startRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${startText}`,
    );
    let startData = await startRes.json();

    // Fetch coordinates for Destination
    let endRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${endText}`,
    );
    let endData = await endRes.json();

    if (startData.length === 0 || endData.length === 0) {
      alert(
        "Could not find one of the locations. Please try adding the state or country.",
      );
      return;
    }

    let startLat = parseFloat(startData[0].lat),
      startLon = parseFloat(startData[0].lon);
    let endLat = parseFloat(endData[0].lat),
      endLon = parseFloat(endData[0].lon);

    // Remove old route if it exists
    if (routingControl) {
      map.removeControl(routingControl);
    }

    // Draw the new route using the fetched coordinates
    routingControl = L.Routing.control({
      waypoints: [L.latLng(startLat, startLon), L.latLng(endLat, endLon)],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: { styles: [{ color: "#3b82f6", opacity: 0.8, weight: 6 }] },
      createMarker: function () {
        return null;
      },
      show: false,
    }).addTo(map);

    routingControl.on("routesfound", function (e) {
      let routes = e.routes;
      let distanceKm = (routes[0].summary.totalDistance / 1000).toFixed(1);
      let timeMin = Math.round(routes[0].summary.totalTime / 60);

      document.getElementById("route-stats").innerHTML =
        `Route Found!<br>Distance: ${distanceKm} km<br>Est. Time: ${timeMin} mins`;
    });
  } catch (error) {
    console.error("Geocoding failed:", error);
    document.getElementById("route-stats").innerHTML = "Routing failed.";
  }
}
