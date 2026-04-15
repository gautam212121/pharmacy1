import React from 'react'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
// import required modules
import { Navigation } from 'swiper/modules';
export default function Homeslider() {
    return (
        <div>
            <Swiper navigation={true} modules={[Navigation]} className="mySwiper m-5 h-60%">
                <SwiperSlide>
                    <div className='item rounded-[20px] overflow-hidden'>
                        <img src="/images/blood-sample.jpg" alt="skp[g" className='w-full h-60   ' />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='item rounded-[20px] overflow-hidden'>
                        <img src="/images/medicine.jpg" alt="skp[g" className='w-full h-60' />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='item rounded-[20px] overflow-hidden'>
                        <img src="/images/Heinens.jpg" alt="skp[g" className='w-full h-60 ' />
                    </div>
                </SwiperSlide>

                <SwiperSlide>
                    <div className='item rounded-[20px] overflow-hidden'>
                        <img src="/images/heart.jpeg" alt="skp[g" className='w-full h-60 ' />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='item rounded-[20px] overflow-hidden'>
                        <img src="/images/blood-sample.jpg" alt="skp[g" className='w-full h-60' />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='item rounded-[20px] overflow-hidden'>
                        <img src="/images/medicine.jpg" alt="skp[g" className='w-full h-60' />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='item rounded-[20px] overflow-hidden'>
                        <img src="/images/Heinens.jpg" alt="skp[g" className='w-full h-60 ' />
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className='item rounded-[20px] overflow-hidden'>
                        <img src="/images/heart.jpeg" alt="skp[g" className='w-full h-60 ' />
                    </div>
                </SwiperSlide>
            </Swiper>

        </div>
    )
}

