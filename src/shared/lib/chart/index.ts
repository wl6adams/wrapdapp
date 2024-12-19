export const customLinePlugin = {
  id: 'verticalHoverLine',
  beforeEvent(chart: any, args: any) {
    const { event } = args;

    // Check if the mouse is moving within the chart area
    if (event.type === 'mousemove') {
      chart.currentMouseX = event.x;
    }
  },

  beforeDatasetsDraw(chart: any, args: any, options: any) {
    const {
      ctx,
      chartArea: { top, bottom },
      scales: { x },
    } = chart;
    ctx.save();
    if (chart.getDatasetMeta(0).data.length && options?.defaultUtilityValue) {
      const xPos = x.getPixelForValue(Math.round(Number(options.defaultUtilityValue)));

      let findActive = false;

      chart.getDatasetMeta(0).data.forEach((dataPoint: any) => {
        if (dataPoint.active) {
          findActive = true;
          ctx.beginPath();
          ctx.strokeColor = '#ffffff';
          ctx.strokeStyle = '#ffffff';
          ctx.fillStyle = '#ffffff';
          ctx.moveTo(dataPoint.x, top);
          ctx.lineTo(dataPoint.x, bottom);
          ctx.stroke();
        }
      });

      if (!findActive) {
        ctx.beginPath();
        ctx.strokeColor = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.moveTo(xPos, top);
        ctx.lineTo(xPos, bottom);
        ctx.stroke();
      }
    } else {
      chart.getDatasetMeta(0).data.forEach((dataPoint: any) => {
        if (dataPoint.active) {
          ctx.beginPath();
          ctx.strokeColor = '#ffffff';
          ctx.strokeStyle = '#ffffff';
          ctx.fillStyle = '#ffffff';
          ctx.moveTo(dataPoint.x, top);
          ctx.lineTo(dataPoint.x, bottom);
          ctx.stroke();
        }
      });
    }
  },
};
