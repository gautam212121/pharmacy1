import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { IoChevronDownOutline } from "react-icons/io5";

import { IoCloseSharp } from "react-icons/io5";

const Categorypanel = (props) => {
    const { isOpenCartPanel, setIsOpenCartPanel, isOpenCatPanel, setIsOpenCatPanel } = props || {};
    const open = typeof isOpenCatPanel !== 'undefined' ? isOpenCatPanel : isOpenCartPanel;
    const setOpen = typeof setIsOpenCatPanel === 'function' ? setIsOpenCatPanel : setIsOpenCartPanel;

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation">
            <h1 className='p-3 text-[20px] font-[500] flex items-center justify-between'>Pharmacy Services
                <IoCloseSharp onClick={toggleDrawer(false)} style={{ cursor: 'pointer' }}
                    className='text-[20px] cursor-pointer  ' />
            </h1>
            <hr />
            <div className='scroll'>
                <ul className='w-full '>
                    <li className=' p-3 border-b'>
                        <button className='w-full !text-left !justify-between !px-3 flex '>Medicines
                            <IoChevronDownOutline className='bold cursor-pointer' />
                        </button>
                        <ul className='pl-5 mt-2' >
                            <li className='py-1 text-[14px]'>Prescription Medicines</li>
                            <li className='py-1 text-[14px]'>OTC Medicines (Over The Counter)</li>
                            <li className='py-1 text-[14px]'>Ayurvedic / Homeopathic Medicines</li>
                            <li className='py-1 text-[14px]'>Generic Medicines</li>
                        </ul>
                    </li>
                    <li className='p-3 border-b'>
                        <button className='w-full !text-left !justify-between !px-3 flex '>Healthcare Products
                            <IoChevronDownOutline className='bold cursor-pointer' />
                        </button>
                        <ul className='pl-4 mt-2'>
                            <li className='py-1 text-[14px]'>Vitamins & Supplements</li>
                            <li className='py-1 text-[14px]'>Personal Care Items</li>
                            <li className='py-1 text-[14px]'>Baby Care</li>
                            <li className='py-1 text-[14px]'>Women Care</li>
                            <li className='py-1 text-[14px]'>Men’s Care</li>
                        </ul>
                    </li>
                    <li className='p-3 border-b'>
                        <button className='w-full !text-left !justify-between !px-3 flex '>Medical Equipment
                            <IoChevronDownOutline className='bold cursor-pointer' />
                        </button>
                        <ul className='pl-4 mt-2'>
                            <li className='py-1 text-[14px]'>Diabetes Care</li>
                            <li className='py-1 text-[14px]'>Fitness & Activity Monitors</li>
                            <li className='py-1 text-[14px]'>Health Monitors</li>
                            <li className='py-1 text-[14px]'>Medical Accessories</li>
                            <li className='py-1 text-[14px]'>Thermometers</li>
                            <li className='py-1 text-[14px]'>Oximeters</li>
                            <li className='py-1 text-[14px]'>Nebulizers</li>

                        </ul>
                    </li>
                    <li className='p-3 border-b'>
                        <button className='w-full !text-left !justify-between !px-3 flex '>Doctor Consultation
                            <IoChevronDownOutline className='bold cursor-pointer' />

                        </button>
                        <ul className='pl-4 mt-2'>
                            <li className='py-1 text-[14px]'>Online/Teleconsultation</li>
                            <li className='py-1 text-[14px]'>In-Clinic Appointment Booking</li>
                            <li className='py-1 text-[14px]'>Follow-Up Consultation</li>
                            <li className='py-1 text-[14px]'>Prescription Renewal / Second Opinion</li>
                            <li className='py-1 text-[14px]'>Pediatric & Family Doctor Services</li>
                            <li className='py-1 text-[14px]'>Mental Health & Counseling Sessions</li>
                            <li className='py-1 text-[14px]'>Home Visit by Doctor (On Request)</li>
                        </ul>
                    </li>
                    <li className='p-3 border-b'>
                        <button className='w-full !text-left !justify-between !px-3 flex '>Wellness & Medical Solutions
                            <IoChevronDownOutline className='bold cursor-pointer' />
                        </button>
                        <ul className='pl-4 mt-2'>
                            <li className='py-1 text-[14px]'>Home Healthcare Services</li>
                            <li className='py-1 text-[14px]'>Nutrition & Diet Consultation</li>
                            <li className='py-1 text-[14px]'>Chronic Care Support</li>
                            <li className='py-1 text-[14px]'>Corporate Healthcare Solutions</li>
                        </ul>
                    </li>
                        <li className='p-3 border-b'>
                            <button className='w-full !text-left !justify-between !px-3 flex '>Lab Tests & Health Packages
                                <IoChevronDownOutline className='bold cursor-pointer' />
                            </button>
                            <ul className='pl-4 mt-2'>
                                <li className='py-1 text-[14px]'>Blood Tests</li>
                                <li className='py-1 text-[14px]'>COVID-19 Tests</li>
                                <li className='py-1 text-[14px]'>Full Body Checkup</li>
                                <li className='py-1 text-[14px]'>Thyroid Function Test</li>
                                <li className='py-1 text-[14px]'>Diabetes Screening</li>
                                <li className='py-1 text-[14px]'>Lipid Profile</li>
                                <li className='py-1 text-[14px]'>Vitamin & Mineral Tests</li>
                                <li className='py-1 text-[14px]'>Kidney & Liver Function Tests</li>
                                <li className='py-1 text-[14px]'>Hormone Tests</li>
                                <li className='py-1 text-[14px]'>Infectious Disease Screening</li>
                                <li className='py-1 text-[14px]'>Allergy Testing</li>
                                <li className='py-1 text-[14px]'>Book a Diagnostic Test at Home</li>
                            </ul>
                        </li>
                        <li className='p-3 border-b'>
                        <button className='w-full !text-left !justify-between !px-3 flex '>Health Services
                            <IoChevronDownOutline className='bold cursor-pointer' />
                        </button>
                        <ul className='pl-4 mt-2'>
                            <li className='py-1 text-[14px]'>Doctor Consultation (Online/Teleconsultation)</li>
                            <li className='py-1 text-[14px]'>Pharmacist Advice</li>
                            <li className='py-1 text-[14px]'>Order on Call / Repeat Order</li>
                            <li className='py-1 text-[14px]'>Lab Tests</li>
                            <li className='py-1 text-[14px]'>Health Checkup Packages</li>
                            <li className='py-1 text-[14px]'>Book a Diagnostic Test at Home</li>
                        </ul>
                    </li>
                    <li className='p-3 border-b'>
                        <button className='w-full !text-left !justify-between !px-3 flex '>Brand
                            <IoChevronDownOutline className='bold cursor-pointer' />
                        </button>
                        <ul className='pl-4 mt-2'>
                            <li className='py-1 text-[14px]'>Branded Medicines</li>
                            <li className='py-1 text-[14px]'>Popular Brands</li>
                            <li className='py-1 text-[14px]'>Brand Partnerships</li>
                        </ul>
                    </li>
                    <li className='p-3 border-b'>
                        <button className='w-full !text-left !justify-between !px-3 flex '>Company
                            <IoChevronDownOutline className='bold cursor-pointer' />
                        </button>
                        <ul className='pl-4 mt-2'>
                            <li className='py-1 text-[14px]'>About Us</li>
                            <li className='py-1 text-[14px]'>Contact Us</li>
                            <li className='py-1 text-[14px]'>Careers</li>
                        </ul>
                    </li>
                </ul>
            </div>
        </Box>
    );

    return (
        <div>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </div>
    );
}

export default Categorypanel;

