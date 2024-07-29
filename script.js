document.addEventListener('DOMContentLoaded', init);

async function init() {
    const scenes = ['#scene-1', '#scene-2', '#scene-3'];
    let currentScene = 0;

    // Load data
    const globalData = await d3.csv("global_life_expectancy.csv", d => ({
        Year: +d.Year,
        LifeExpectancy: +d.LifeExpectancy
    }));

    const regionData = await d3.csv("region_life_expectancy.csv", d => ({
        Region: d.Region,
        LifeExpectancy: +d.LifeExpectancy
    }));

    const countryData = await d3.csv("country_life_expectancy.csv", d => ({
        Country: d.Country,
        Year: +d.Year,
        LifeExpectancy: +d.LifeExpectancy
    }));

    // Initial chart rendering
    updateChartForScene(currentScene);

    // Populate the dropdown menu with country options
    const countries = Array.from(new Set(countryData.map(d => d.Country)));
    const countrySelect = d3.select("#country-select");
    countrySelect.selectAll("option")
        .data(countries)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d);

    // Add event listeners to buttons
    document.getElementById('next').addEventListener('click', () => {
        if (currentScene < scenes.length - 1) {
            d3.select(scenes[currentScene]).classed('active', false);
            currentScene++;
            d3.select(scenes[currentScene]).classed('active', true);
            updateChartForScene(currentScene);
        }
    });

    document.getElementById('previous').addEventListener('click', () => {
        if (currentScene > 0) {
            d3.select(scenes[currentScene]).classed('active', false);
            currentScene--;
            d3.select(scenes[currentScene]).classed('active', true);
            updateChartForScene(currentScene);
        }
    });

    d3.select("#country-select").on("change", function() {
        const selectedCountry = d3.select(this).property("value");
        updateCountryChart(selectedCountry);
    });

    function createLineChart(data) {
        console.log("Creating line chart..."); // Debugging
        // Clear existing SVG content
        d3.select("#line-chart").selectAll("*").remove();

        const svg = d3.select("#line-chart").append("svg")
            .attr("width", 800)
            .attr("height", 600);

        const margin = { top: 20, right: 30, bottom: 60, left: 50 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.Year, 0, 1)))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([d3.min(data, d => d.LifeExpectancy), d3.max(data, d => d.LifeExpectancy)])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(new Date(d.Year, 0, 1)))
            .y(d => y(d.LifeExpectancy));

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).tickSize(0))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        g.append("g")
            .call(d3.axisLeft(y));

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // Annotation for COVID-19
        const annotations = [
            {
                note: {
                    label: "COVID-19 Pandemic Began",
                    align: "middle"
                },
                x: x(new Date(2019, 0, 1)),
                y: y(d3.mean(data.filter(d => d.Year === 2019), d => d.LifeExpectancy)),
                dy: -40,
                dx: 20
            }
        ];

        const makeAnnotations = d3.annotation()
            .type(d3.annotationLabel)
            .annotations(annotations);

        g.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
    }

    function createRegionChart(data) {
        console.log("Creating region chart..."); // Debugging
        // Clear existing SVG content
        d3.select("#region-chart").selectAll("*").remove();

        const svg = d3.select("#region-chart").append("svg")
            .attr("width", 800)
            .attr("height", 600);

        const margin = { top: 20, right: 30, bottom: 60, left: 50 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand().domain(data.map(d => d.Region)).range([0, width]).padding(0.1);
        const y = d3.scaleLinear().domain([0, d3.max(data, d => d.LifeExpectancy)]).range([height, 0]);

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        g.append("g")
            .call(d3.axisLeft(y));

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.Region))
            .attr("y", d => y(d.LifeExpectancy))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.LifeExpectancy))
            .attr("fill", "steelblue");
    }

    function createCountryChart(data) {
        console.log("Creating country chart..."); // Debugging
        // Clear existing SVG content
        d3.select("#country-chart").selectAll("*").remove();

        const svg = d3.select("#country-chart").append("svg")
            .attr("width", 800)
            .attr("height", 600);

        const margin = { top: 20, right: 30, bottom: 60, left: 50 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.Year, 0, 1)))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([d3.min(data, d => d.LifeExpectancy), d3.max(data, d => d.LifeExpectancy)])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(new Date(d.Year, 0, 1)))
            .y(d => y(d.LifeExpectancy));

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).tickSize(0))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        g.append("g")
            .call(d3.axisLeft(y));

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        g.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(new Date(d.Year, 0, 1)))
            .attr("cy", d => y(d.LifeExpectancy))
            .attr("r", 3)
            .attr("fill", "steelblue");
    }

    function updateChartForScene(sceneIndex) {
        if (sceneIndex === 0) {
            createLineChart(globalData);
        } else if (sceneIndex === 1) {
            createRegionChart(regionData);
        } else if (sceneIndex === 2) {
            createCountryChart(countryData);
        }
    }

    function updateCountryChart(selectedCountry) {
        const filteredData = countryData.filter(d => d.Country === selectedCountry);
        createCountryChart(filteredData);
    }
}
