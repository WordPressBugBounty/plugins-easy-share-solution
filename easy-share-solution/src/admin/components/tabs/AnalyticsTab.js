/**
 * Analytics Tab Component
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardBody,
    __experimentalGrid as Grid,
    __experimentalText as Text,
    __experimentalHeading as Heading,
    SelectControl,
    Spinner,
    Notice,
    Flex,
    FlexItem,
    __experimentalSpacer as Spacer,
    Button
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { PlatformIcon } from '../../../components/PlatformIcon';
import ProFeature from '../ProFeature';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AnalyticsTab = ({ isProActive, hasProFeature }) => {
    // Platform name mapping for display purposes
    const getPlatformDisplayName = (platform) => {
        const platformNames = {
            'x_com': 'X.com',
            'twitter': 'X.com',
            'facebook': 'Facebook',
            'linkedin': 'LinkedIn',
            'pinterest': 'Pinterest',
            'whatsapp': 'WhatsApp',
            'telegram': 'Telegram',
            'reddit': 'Reddit',
            'tumblr': 'Tumblr',
            'email': 'Email'
        };
        
        return platformNames[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
    };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('30');
    const [overview, setOverview] = useState(null);
    const [platformStats, setPlatformStats] = useState([]);
    const [contentStats, setContentStats] = useState([]);
    const [dailyStats, setDailyStats] = useState([]);
    const [showingTestData, setShowingTestData] = useState(false);

    const periodOptions = [
        { label: __('Today', 'easy-share-solution'), value: '1' },
        { label: __('Last 7 days', 'easy-share-solution'), value: '7' },
        { label: __('Last 30 days', 'easy-share-solution'), value: '30' },
        { label: __('Last 90 days', 'easy-share-solution'), value: '90' }
    ];

    useEffect(() => {
        loadAnalyticsData();
    }, [period, isProActive]);

    const loadAnalyticsData = async () => {
        setLoading(true);
        setError(null);
        setShowingTestData(false);

        try {
            // Load data from mixed sources (real database + JSON test data)
            const [overviewRes, platformRes, contentRes, dailyRes] = await Promise.all([
                apiFetch({ path: `/easy-share/v1/analytics/overview?period=${period}` }),
                apiFetch({ path: `/easy-share/v1/analytics/platform-stats?period=${period}` }),
                apiFetch({ path: `/easy-share/v1/analytics/content-stats?period=${period}` }),
                apiFetch({ path: `/easy-share/v1/analytics/daily-stats?period=${period}` })
            ]);

            // Set the data (API now handles mixing real + test data automatically)
            setOverview(overviewRes);
            setPlatformStats(platformRes);
            setContentStats(contentRes);
            setDailyStats(dailyRes);

            // Check if we're showing test data (based on API response metadata)
            const isShowingTestData = (
                overviewRes?.is_test_data || 
                overviewRes?.data_source === 'json_file'
            );
            
            setShowingTestData(isShowingTestData);

        } catch (err) {
            console.error('Analytics API Error:', err);
            setError(__('Failed to load analytics data. Please check your connection and try again.', 'easy-share-solution'));
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num?.toString() || '0';
    };

    const formatGrowth = (percentage) => {
        const isPositive = percentage >= 0;
        const color = isPositive ? '#00a32a' : '#d63638';
        const symbol = isPositive ? '+' : '';
        
        return (
            <span style={{ color, fontWeight: '600' }}>
                {symbol}{percentage}%
            </span>
        );
    };

    // Chart Data Preparation Functions
    const getDailyTrendsChartData = () => {
        if (!dailyStats || dailyStats.length === 0) return null;

        const sortedData = [...dailyStats].sort((a, b) => new Date(a.stat_date) - new Date(b.stat_date));
        
        return {
            labels: sortedData.map(item => 
                new Date(item.stat_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                })
            ),
            datasets: [
                {
                    label: __('Daily Shares', 'easy-share-solution'),
                    data: sortedData.map(item => parseInt(item.total_shares) || 0),
                    borderColor: '#007cba',
                    backgroundColor: 'rgba(0, 124, 186, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#007cba',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    };

    const getPlatformChartData = () => {
        if (!platformStats || platformStats.length === 0) return null;

        const colors = [
            '#007cba', '#00a32a', '#d63638', '#ff8c00', 
            '#8b2fc9', '#e91e63', '#607d8b', '#795548'
        ];

        return {
            labels: platformStats.map(platform => 
                getPlatformDisplayName(platform.platform)
            ),
            datasets: [
                {
                    label: __('Shares by Platform', 'easy-share-solution'),
                    data: platformStats.map(platform => parseInt(platform.total_shares) || 0),
                    backgroundColor: colors.slice(0, platformStats.length),
                    borderWidth: 0,
                    hoverOffset: 4
                }
            ]
        };
    };

    const getContentPerformanceChartData = () => {
        if (!contentStats || contentStats.length === 0) return null;

        const topContent = contentStats.slice(0, 10);
        
        return {
            labels: topContent.map((content, index) => 
                content.post_title ? 
                    (content.post_title.length > 20 ? 
                        content.post_title.substring(0, 20) + '...' : 
                        content.post_title
                    ) : 
                    `Post #${index + 1}`
            ),
            datasets: [
                {
                    label: __('Content Shares', 'easy-share-solution'),
                    data: topContent.map(content => parseInt(content.total_shares) || 0),
                    backgroundColor: 'rgba(0, 124, 186, 0.8)',
                    borderColor: '#007cba',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                }
            ]
        };
    };

    // Chart Options
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                cornerRadius: 6,
                displayColors: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#757575',
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: '#757575',
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    color: '#1e1e1e',
                    font: {
                        size: 12,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                cornerRadius: 6
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                cornerRadius: 6,
                displayColors: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#757575',
                    font: {
                        size: 11
                    },
                    maxRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: '#757575',
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="easy-share-analytics-loading">
                <Spinner />
                <Text>{__('Loading analytics data...', 'easy-share-solution')}</Text>
            </div>
        );
    }

    if (error) {
        return (
            <Notice status="error" isDismissible={false}>
                {error}
            </Notice>
        );
    }

    // Check for data states
    const hasData = overview && (overview.total_shares > 0 || platformStats.length > 0 || contentStats.length > 0 || dailyStats.length > 0);
    
    return (
        <Card>
            <CardBody>
                <div className="easy-share-analytics-tab">
                    {/* Pro Notice for Free Users */}
                    {!isProActive && (
                        <Notice 
                            status="warning" 
                            isDismissible={false}
                            className="ess-analytics-pro-notice"
                        >
                            <div className="ess-analytics-notice-text">
                                <h4>{__('Analytics Preview - Sample Data', 'easy-share-solution')}</h4>
                                <p>{__('You are viewing sample data. Upgrade to Pro to unlock full analytics with real-time data, advanced insights, and detailed reports.', 'easy-share-solution')}</p>
                            </div>
                            <Button 
                                className="ess-pro-button ess-upgrade-pro-header-button"
                                href="https://wpthemespace.com/product/easy-share-solution/#pricing"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {__('Upgrade to Pro', 'easy-share-solution')}
                            </Button>
                        </Notice>
                    )}
                    
                    <div className="analytics-header">
                        <Flex justify="space-between" align="center">
                            <FlexItem>
                                <Heading level={2}>
                                    {__('Analytics Dashboard', 'easy-share-solution')}
                                    {!isProActive && (
                                        <span className="ess-pro-label" style={{ marginLeft: '8px', color: '#d63638', fontSize: '12px', fontWeight: 'bold' }}>
                                            {__('PREVIEW', 'easy-share-solution')}
                                        </span>
                                    )}
                                </Heading>
                                <Text variant="muted">
                                    {isProActive 
                                        ? __('Track your social sharing performance and engagement.', 'easy-share-solution')
                                        : __('Preview of analytics dashboard with sample data - upgrade to Pro for real analytics.', 'easy-share-solution')
                                    }
                                </Text>
                            </FlexItem>
                            <FlexItem>
                                <SelectControl 
                                    label={__('Time Period', 'easy-share-solution')}
                                    value={period}
                                    options={periodOptions}
                                    onChange={setPeriod}
                                    __nextHasNoMarginBottom={true}
                                    __next40pxDefaultSize={true}
                                    style={{ minWidth: '200px' }}
                                />
                            </FlexItem>
                        </Flex>
                    </div>

                    <Spacer marginTop={6} />

                    {/* Smart Data Source Indicator */}
                    {showingTestData && (
                        <>
                            <Notice 
                                status="warning" 
                                isDismissible={false}
                                style={{ 
                                    margin: '0 0 20px 0',
                                    border: '2px solid #ff8c00',
                                    backgroundColor: '#fff8e1',
                                    borderRadius: '8px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>🧪</span>
                                    <div>
                                        <strong style={{ color: '#e65100', fontSize: '16px' }}>
                                            {__('Displaying Sample Data from JSON File', 'easy-share-solution')}
                                        </strong>
                                        <br />
                                        <span style={{ color: '#bf360c', fontSize: '14px' }}>
                                            {__('No real sharing activity detected. Start sharing content to see live analytics from your database.', 'easy-share-solution')}
                                        </span>
                                    </div>
                                </div>
                            </Notice>
                            <Spacer marginTop={4} />
                        </>
                    )}

            {/* Overview Cards */}
            <Grid columns={4} gap={4} className="analytics-overview">
                <Card className="analytics-card">
                    <CardBody>
                        <div className="analytics-metric">
                            <div className="metric-value">
                                {formatNumber(overview?.total_shares)}
                            </div>
                            <div className="metric-label">
                                {__('Total Shares', 'easy-share-solution')}
                            </div>
                            <div className="metric-growth">
                                {formatGrowth(overview?.growth_percentage || 0)}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="analytics-card">
                    <CardBody>
                        <div className="analytics-metric">
                            <div className="metric-value">
                                {formatNumber(overview?.unique_posts)}
                            </div>
                            <div className="metric-label">
                                {__('Content Shared', 'easy-share-solution')}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="analytics-card">
                    <CardBody>
                        <div className="analytics-metric">
                            <div className="metric-value">
                                {platformStats?.length || 0}
                            </div>
                            <div className="metric-label">
                                {__('Active Platforms', 'easy-share-solution')}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="analytics-card">
                    <CardBody>
                        <div className="analytics-metric">
                            <div className="metric-value">
                                <Flex align="center" gap={2} justify="center">
                                    {overview?.top_platforms?.[0]?.platform && (
                                        <PlatformIcon 
                                            platform={overview.top_platforms[0].platform} 
                                            size={20} 
                                        />
                                    )}
                                    <span>
                                        {overview?.top_platforms?.[0]?.platform ? 
                                         getPlatformDisplayName(overview.top_platforms[0].platform) : 'N/A'}
                                    </span>
                                </Flex>
                            </div>
                            <div className="metric-label">
                                {__('Top Platform', 'easy-share-solution')}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Grid>

            <Spacer marginTop={8} />

            {/* Charts Section */}
            <Grid columns={2} gap={6}>
                {/* Platform Performance Chart */}
                <Card>
                    <CardBody>
                        <Heading level={3} className="chart-title">
                            {__('Platform Distribution', 'easy-share-solution')}
                        </Heading>
                        <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
                            {getPlatformChartData() ? (
                                <Doughnut 
                                    data={getPlatformChartData()} 
                                    options={doughnutChartOptions}
                                />
                            ) : (
                                <div className="no-data">
                                    {__('No platform data available for this period.', 'easy-share-solution')}
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Content Performance Chart */}
                <Card>
                    <CardBody>
                        <Heading level={3} className="chart-title">
                            {__('Top Content Performance', 'easy-share-solution')}
                        </Heading>
                        <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
                            {getContentPerformanceChartData() ? (
                                <Bar 
                                    data={getContentPerformanceChartData()} 
                                    options={barChartOptions}
                                />
                            ) : (
                                <div className="no-data">
                                    {__('No content data available for this period.', 'easy-share-solution')}
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </Grid>

            <Spacer marginTop={8} />

            {/* Enhanced Platform Stats Table */}
            <Grid columns={2} gap={6}>
                <Card>
                    <CardBody>
                        <Heading level={3} className="chart-title">
                            {__('Platform Performance Details', 'easy-share-solution')}
                        </Heading>
                        <div className="platform-stats">
                            {platformStats.length > 0 ? (
                                platformStats.slice(0, 8).map((platform, index) => (
                                    <div key={platform.platform} className="platform-stat-item">
                                        <Flex justify="space-between" align="center">
                                            <FlexItem>
                                                <Flex align="center" gap={3}>
                                                    <div className="platform-icon-wrapper">
                                                        <PlatformIcon 
                                                            platform={platform.platform} 
                                                            size={24} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="platform-name">
                                                            {getPlatformDisplayName(platform.platform)}
                                                        </div>
                                                        <div className="platform-details">
                                                            {platform.unique_posts} {__('posts', 'easy-share-solution')} • 
                                                            {Math.round(platform.avg_shares || 0)} {__('avg', 'easy-share-solution')}
                                                        </div>
                                                    </div>
                                                </Flex>
                                            </FlexItem>
                                            <FlexItem>
                                                <div className="platform-shares">
                                                    {formatNumber(platform.total_shares)}
                                                </div>
                                                <div className="platform-bar">
                                                    <div 
                                                        className="platform-bar-fill"
                                                        style={{
                                                            width: `${(platform.total_shares / (platformStats[0]?.total_shares || 1)) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                            </FlexItem>
                                        </Flex>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">
                                    {__('No platform data available for this period.', 'easy-share-solution')}
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Top Content List */}
                <Card>
                    <CardBody>
                        <Heading level={3} className="chart-title">
                            {__('Top Shared Content', 'easy-share-solution')}
                        </Heading>
                        <div className="content-stats">
                            {contentStats.length > 0 ? (
                                contentStats.slice(0, 8).map((content, index) => (
                                    <div key={content.post_id} className="content-stat-item">
                                        <div className="content-rank">#{index + 1}</div>
                                        <div className="content-details">
                                            <div className="content-title">
                                                {content.post_title || __('Untitled', 'easy-share-solution')}
                                            </div>
                                            <div className="content-meta">
                                                <span className="content-shares">
                                                    {formatNumber(content.total_shares)} {__('shares', 'easy-share-solution')}
                                                </span>
                                                <span className="content-platforms">
                                                    {content.platforms_used} {__('platforms', 'easy-share-solution')}
                                                </span>
                                                <span className="content-type">
                                                    {content.post_type}
                                                </span>
                                            </div>
                                            {content.post_url && (
                                                <a 
                                                    href={content.post_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="content-link"
                                                >
                                                    {__('View Post', 'easy-share-solution')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">
                                    {__('No content data available for this period.', 'easy-share-solution')}
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </Grid>

            <Spacer marginTop={8} />

            {/* Daily Trends Chart - Enhanced */}
            <Card>
                <CardBody>
                    <Heading level={3} className="chart-title">
                        {__('Daily Sharing Trends', 'easy-share-solution')}
                    </Heading>
                    <div className="daily-trends">
                        {getDailyTrendsChartData() ? (
                            <>
                                <div className="chart-container" style={{ height: '300px', position: 'relative', marginBottom: '24px' }}>
                                    <Line 
                                        data={getDailyTrendsChartData()} 
                                        options={lineChartOptions}
                                    />
                                </div>
                                <div className="trends-summary">
                                    <Grid columns={4} gap={4}>
                                        <div className="summary-item">
                                            <div className="summary-value">
                                                {formatNumber(dailyStats.reduce((sum, day) => sum + parseInt(day.total_shares || 0), 0))}
                                            </div>
                                            <div className="summary-label">
                                                {__('Total Shares', 'easy-share-solution')}
                                            </div>
                                        </div>
                                        <div className="summary-item">
                                            <div className="summary-value">
                                                {dailyStats.length > 0 ? Math.round(dailyStats.reduce((sum, day) => sum + parseInt(day.total_shares || 0), 0) / dailyStats.length) : 0}
                                            </div>
                                            <div className="summary-label">
                                                {__('Daily Average', 'easy-share-solution')}
                                            </div>
                                        </div>
                                        <div className="summary-item">
                                            <div className="summary-value">
                                                {dailyStats.length > 0 ? Math.max(...dailyStats.map(d => parseInt(d.total_shares || 0))) : 0}
                                            </div>
                                            <div className="summary-label">
                                                {__('Peak Day', 'easy-share-solution')}
                                            </div>
                                        </div>
                                        <div className="summary-item">
                                            <div className="summary-value">
                                                {dailyStats.length}
                                            </div>
                                            <div className="summary-label">
                                                {__('Days Tracked', 'easy-share-solution')}
                                            </div>
                                        </div>
                                    </Grid>
                                </div>
                            </>
                        ) : (
                            <div className="no-data">
                                {__('No daily trend data available for this period.', 'easy-share-solution')}
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
                </div>
            </CardBody>
        </Card>
    );
};

export default AnalyticsTab;
