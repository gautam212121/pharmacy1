"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

export default function Homeslider() {
  return (
    <div>
      <Swiper
        navigation={true}
        modules={[Navigation]}
        className="mySwiper m-5"
      >
        <SwiperSlide>
          <div className="item rounded-[20px] overflow-hidden">
            <img
              src="/images/blood-sample.jpg"
              alt="Blood Sample"
              className="w-full h-60 object-cover"
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="item rounded-[20px] overflow-hidden">
            <img
              src="/images/medicine.jpg"
              alt="Medicine"
              className="w-full h-60 object-cover"
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="item rounded-[20px] overflow-hidden">
            <img
              src="/images/Heinens.jpg"
              alt="Heinens"
              className="w-full h-60 object-cover"
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="item rounded-[20px] overflow-hidden">
            <img
              src="/images/heart.jpeg"
              alt="Heart"
              className="w-full h-60 object-cover"
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="item rounded-[20px] overflow-hidden">
            <img
              src="/images/blood-sample.jpg"
              alt="Blood Sample"
              className="w-full h-60 object-cover"
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="item rounded-[20px] overflow-hidden">
            <img
              src="/images/medicine.jpg"
              alt="Medicine"
              className="w-full h-60 object-cover"
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="item rounded-[20px] overflow-hidden">
            <img
              src="/images/Heinens.jpg"
              alt="Heinens"
              className="w-full h-60 object-cover"
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="item rounded-[20px] overflow-hidden">
            <img
              src="/images/heart.jpeg"
              alt="Heart"
              className="w-full h-60 object-cover"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}