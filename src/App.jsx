import React, { useEffect, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBRow,
  MDBTypography,
} from "mdb-react-ui-kit";
import { format, subHours, addHours } from "date-fns";
import mqtt from "mqtt";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function App() {
  const [currentTime, setCurrentTime] = useState("");
  const [forecastTime, setForcastTime] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [forecast, SetForecast] = useState("YES");
  const [weatherData, setWeatherData] = useState(null);
  const [status, setStatus] = useState(1);
  const [data, setData] = useState([]);
  const [predict, setPredict] = useState([]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          "https://api.openweathermap.org/data/2.5/forecast?lat=21.0285&lon=21.0285&appid=c1f57aa1331296e53dd5007a5f25ab1b"
        );
        const data = await response.json();
        setWeatherData(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    fetchWeatherData();
  }, []);

  useEffect(() => {
    const client = mqtt.connect("wss://mqtt-dashboard.com:8884/mqtt");

    client.on("connect", () => {
      console.log("Kết nối thành công");
      client.subscribe("predict/label");
      client.subscribe("ESP32WI/DHT11/Temperature01");
      client.subscribe("predict5");
    });

    client.on("message", (topic, message) => {
      if (topic === "ESP32WI/DHT11/Temperature01") {
        setTemperature(message.toString().split("||")[0]);
        setHumidity(message.toString().split("||")[1]);
        setData((prevData) => {
          const newData = [
            ...prevData,
            {
              time: format(new Date(), "HH:mm:ss"),
              temp: message.toString().split("||")[0],
              humi: message.toString().split("||")[1],
            },
          ];
          if (newData.length > 10) {
            return newData.slice(newData.length - 10);
          }
          return newData;
        });
        console.log(`Nhiệt độ: ${temperature}`);
        console.log(`Độ ẩm: ${humidity}`);
      } else if (topic === "predict/label") {
        SetForecast(message.toString());
        console.log(forecast);
      } else if (topic === "predict5") {
        setPredict(message.toString().split(","));
        console.log(predict);
      }
    });
    return () => {
      client.end();
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = format(new Date(), "HH:mm");
      setCurrentTime(now);
      const currentTime = new Date();
      const oneHourAgo = addHours(currentTime, 1);
      const formattedTime = format(oneHourAgo, "HH:mm");
      setForcastTime(formattedTime);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date_txt) => {
    if (date_txt === null) return "";
    const date = new Date(date_txt);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day} / ${month}`;
  };

  return (
    <div className="">
      <br />
      <br />
      <br />
      <section className="vh-200">
        <MDBContainer className="h-200">
          <MDBRow
            className="justify-content-center align-items-center"
            style={{ color: "#282828" }}
          >
            <MDBCol>
              <div className="row">
                <div className="col-4">
                  <MDBCard style={{ color: "#4B515D", borderRadius: "35px" }}>
                    <MDBCardBody
                      className="p-4"
                      style={{
                        backgroundColor: "#D8A2DB",
                        borderRadius: "25px",
                      }}
                    >
                      <div className="d-flex">
                        <MDBTypography tag="h6" className="flex-grow-1">
                          Nhiệt độ
                        </MDBTypography>
                        <MDBTypography tag="h6">{currentTime}</MDBTypography>
                      </div>

                      <div className="d-flex flex-column text-center mt-3 mb-3">
                        <MDBTypography
                          tag="h6"
                          className="display-6 mb-0 font-weight-bold"
                          style={{ color: "#1C2331" }}
                        >
                          {" "}
                          {temperature}°C{" "}
                        </MDBTypography>
                      </div>
                    </MDBCardBody>
                  </MDBCard>
                </div>
                <div className="col-4">
                  <MDBCard style={{ color: "#4B515D", borderRadius: "35px" }}>
                    <MDBCardBody
                      className="p-4"
                      style={{
                        backgroundColor: "#95DDF5",
                        borderRadius: "25px",
                      }}
                    >
                      <div className="d-flex">
                        <MDBTypography tag="h6" className="flex-grow-1">
                          Độ ẩm
                        </MDBTypography>
                        <MDBTypography tag="h6">{currentTime}</MDBTypography>
                      </div>

                      <div className="d-flex flex-column text-center mt-3 mb-3">
                        <MDBTypography
                          tag="h6"
                          className="display-6 mb-0 font-weight-bold"
                          style={{ color: "#1C2331" }}
                        >
                          {" "}
                          <MDBIcon
                            fas
                            icon="tint fa-fw"
                            style={{ color: "#868B94" }}
                          />{" "}
                          <span className="ms"> {humidity}% </span>{" "}
                        </MDBTypography>
                      </div>
                    </MDBCardBody>
                  </MDBCard>
                </div>
                <div className="col-4">
                  <MDBCard style={{ color: "#4B515D", borderRadius: "35px" }}>
                    <MDBCardBody className="p-4">
                      <div className="d-flex">
                        <MDBTypography tag="h6" className="flex-grow-1">
                          Cảnh báo
                        </MDBTypography>
                        <MDBTypography tag="h6">{forecastTime}</MDBTypography>
                      </div>

                      <div className="d-flex flex-column text-center mb-3">
                        <MDBTypography
                          tag="h6"
                          className="display-6 mb-0 font-weight-bold"
                          style={{ color: "#1C2331" }}
                          onClick={() => setStatus(1 - status)}
                        >
                          {" "}
                          <img
                            src={
                              forecast === "Yes"
                                ? "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-weather/ilu1.webp"
                                : "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-weather/ilu3.webp"
                            }
                            width="100px"
                          />{" "}
                        </MDBTypography>
                      </div>
                    </MDBCardBody>
                  </MDBCard>
                </div>
              </div>

              <br />
              <div className="row">
                <div className="col-6">
                  <MDBCard style={{ color: "#4B515D", borderRadius: "35px" }}>
                    <MDBCardBody className="p-4">
                      <div className="d-flex">
                        <MDBTypography tag="h6" className="flex-grow-1">
                          Biểu đồ nhiệt độ
                        </MDBTypography>
                      </div>

                      <div className="d-flex flex-column text-center mt-3 mb-3">
                        <center>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis
                                domain={[
                                  parseFloat(
                                    Math.min(
                                      ...data.map((item) => item.temp)
                                    ).toFixed(1)
                                  ) - 0.25,
                                  parseFloat(
                                    Math.max(
                                      ...data.map((item) => item.temp)
                                    ).toFixed(1)
                                  ) + 0.25,
                                ]}
                                strokeWidth={2}
                              />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="temp"
                                stroke="#8884d8"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </center>
                      </div>
                    </MDBCardBody>
                  </MDBCard>
                </div>
                <div className="col-6">
                  <MDBCard style={{ color: "#4B515D", borderRadius: "35px" }}>
                    <MDBCardBody className="p-4">
                      <div className="d-flex">
                        <MDBTypography tag="h6" className="flex-grow-1">
                          Biểu đồ độ ẩm
                        </MDBTypography>
                      </div>

                      <div className="d-flex flex-column text-center mt-3 mb-3">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis
                              domain={[
                                parseFloat(
                                  Math.min(
                                    ...data.map((item) => item.humi)
                                  ).toFixed(1)
                                ) - 0.25,
                                parseFloat(
                                  Math.max(
                                    ...data.map((item) => item.humi)
                                  ).toFixed(1)
                                ) + 0.25,
                              ]}
                              strokeWidth={2}
                            />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="humi"
                              stroke="#8884d8"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </MDBCardBody>
                  </MDBCard>
                </div>
              </div>

              <br />
              {/* <MDBCard style={{ color: "#4B515D", borderRadius: "35px" }}>
                <MDBCardBody className="p-4">
                  <div className="d-flex">
                    <MDBTypography tag="h6" className="flex-grow-1">
                      Hanoi, Vietnam
                    </MDBTypography>
                    <MDBTypography tag="h6">{forecastTime}</MDBTypography>
                  </div>

                  <div className="d-flex flex-column text-center mt-5 mb-4">
                    <MDBTypography
                      tag="h6"
                      className="display-4 mb-0 font-weight-bold"
                      style={{ color: "#1C2331" }}
                    >
                      {" "}
                      <div>
                        <img
                          src={
                            forecast === "Yes"
                              ? "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-weather/ilu1.webp"
                              : "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-weather/ilu3.webp"
                          }
                          width="100px"
                        />
                      </div>{" "}
                    </MDBTypography>
                  </div>
                </MDBCardBody>
              </MDBCard> */}
              <MDBCard className="mb-5" style={{ borderRadius: "25px" }}>
                <MDBCardBody
                  className="p-4"
                  style={{
                    backgroundColor: "#98ABB1",
                    borderRadius: "25px",
                  }}
                >
                  <div className="d-flex justify-content-around text-center pb-3 pt-2">
                    <div className="flex-column">
                      <p className="small">
                        <strong>
                          {/* {weatherData
                            ? Math.round(
                                weatherData.list[1].main.feels_like - 275
                              )
                            : ""} */}
                          {predict.length > 0
                            ? Number(predict[0]).toFixed(1)
                            : ""}
                          °C,
                          {predict.length > 0
                            ? Number(predict[5]).toFixed(1)
                            : ""}{" "}
                          %
                        </strong>
                      </p>
                      <MDBIcon
                        fas
                        icon={
                          weatherData
                            ? weatherData.list[1].weather[0].main === "Clouds"
                              ? "cloud"
                              : weatherData.list[1].weather[0].main === "Clear"
                              ? "sun"
                              : "cloud-showers-heavy"
                            : "sun"
                        }
                        size="2x"
                        className="mb-3"
                        style={{ color: "#ddd" }}
                      />
                      <p className="mb-0">
                        <strong>
                          {weatherData
                            ? formatDate(weatherData.list[1].dt_txt)
                            : ""}
                        </strong>
                      </p>
                    </div>
                    <div className="flex-column">
                      <p className="small">
                        <strong>
                          {/* {weatherData
                            ? Math.round(
                                weatherData.list[9].main.feels_like - 275
                              )
                            : ""} */}
                          {predict.length > 0
                            ? Number(predict[1]).toFixed(1)
                            : ""}
                          °C,
                          {predict.length > 0
                            ? Number(predict[6]).toFixed(1)
                            : ""}{" "}
                          %
                        </strong>
                      </p>
                      <MDBIcon
                        fas
                        icon={
                          weatherData
                            ? weatherData.list[9].weather[0].main === "Clouds"
                              ? "cloud"
                              : weatherData.list[9].weather[0].main === "Clear"
                              ? "sun"
                              : "cloud-showers-heavy"
                            : "sun"
                        }
                        size="2x"
                        className="mb-3"
                        style={{ color: "#ddd" }}
                      />
                      <p className="mb-0">
                        <strong>
                          {weatherData
                            ? formatDate(weatherData.list[9].dt_txt)
                            : ""}
                        </strong>
                      </p>
                    </div>
                    <div className="flex-column">
                      <p className="small">
                        <strong>
                          {/* {weatherData
                            ? Math.round(
                                weatherData.list[17].main.feels_like - 275
                              )
                            : ""} */}
                          {predict.length > 0
                            ? Number(predict[2]).toFixed(1)
                            : ""}
                          °C,{" "}
                          {predict.length > 0
                            ? Number(predict[7]).toFixed(1)
                            : ""}{" "}
                          %
                        </strong>
                      </p>
                      <MDBIcon
                        fas
                        icon={
                          weatherData
                            ? weatherData.list[17].weather[0].main === "Clouds"
                              ? "cloud"
                              : weatherData.list[17].weather[0].main === "Clear"
                              ? "sun"
                              : "cloud-showers-heavy"
                            : "sun"
                        }
                        size="2x"
                        className="mb-3"
                        style={{ color: "#ddd" }}
                      />
                      <p className="mb-0">
                        <strong>
                          {weatherData
                            ? formatDate(weatherData.list[17].dt_txt)
                            : ""}
                        </strong>
                      </p>
                    </div>
                    <div className="flex-column">
                      <p className="small">
                        <strong>
                          {/* {weatherData
                            ? Math.round(
                                weatherData.list[25].main.feels_like - 275
                              )
                            : ""} */}
                          {predict.length > 0
                            ? Number(predict[3]).toFixed(1)
                            : ""}
                          °C,{" "}
                          {predict.length > 0
                            ? Number(predict[8]).toFixed(1)
                            : ""}{" "}
                          %
                        </strong>
                      </p>
                      <MDBIcon
                        fas
                        icon={
                          weatherData
                            ? weatherData.list[25].weather[0].main === "Clouds"
                              ? "cloud"
                              : weatherData.list[25].weather[0].main === "Clear"
                              ? "sun"
                              : "cloud-showers-heavy"
                            : "sun"
                        }
                        size="2x"
                        className="mb-3"
                        style={{ color: "#ddd" }}
                      />
                      <p className="mb-0">
                        <strong>
                          {weatherData
                            ? formatDate(weatherData.list[25].dt_txt)
                            : ""}
                        </strong>
                      </p>
                    </div>
                    <div className="flex-column">
                      <p className="small">
                        <strong>
                          {/* {weatherData
                            ? Math.round(
                                weatherData.list[33].main.feels_like - 275
                              )
                            : ""} */}
                          {predict.length > 0
                            ? Number(predict[4]).toFixed(1)
                            : ""}
                          °C,{" "}
                          {predict.length > 0
                            ? Number(predict[9]).toFixed(1)
                            : ""}{" "}
                          %
                        </strong>
                      </p>
                      <MDBIcon
                        fas
                        icon={
                          weatherData
                            ? weatherData.list[33].weather[0].main === "Clouds"
                              ? "cloud"
                              : weatherData.list[33].weather[0].main === "Clear"
                              ? "sun"
                              : "cloud-showers-heavy"
                            : "sun"
                        }
                        size="2x"
                        className="mb-3"
                        style={{ color: "#ddd" }}
                      />
                      <p className="mb-0">
                        <strong>
                          {weatherData
                            ? formatDate(weatherData.list[33].dt_txt)
                            : ""}
                        </strong>
                      </p>
                    </div>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </div>
  );
}
