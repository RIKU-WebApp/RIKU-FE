import './EventCard.css';
import flashrunimage from '../../assets/Run/flashrunimage.svg';
import runargent from '../../assets/Run/run-urgent.svg';
import React from 'react';


interface EventCardProps {
    title: string;
    date: string;
    people: string;
    status?: string;
    imageSrc?: string;
    path?: string;
    onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ title, date, people, status, imageSrc, path, onClick }) => {
    return (
        <div className="event-card" onClick={onClick}>
            <div className='left-side'>
                <div className='title'>
                    {title}
                </div>
                <div className='date'>
                    {date}
                </div>
            </div>
            <div className='right-side'>
                <div>
                    {people}
                </div>
                <div>
                    <img src={runargent} alt='runstate' className='runstate' />
                </div>
                <img src={flashrunimage} alt={title} className="event-image" />
            </div>
        </div>
    );
}

export default EventCard;