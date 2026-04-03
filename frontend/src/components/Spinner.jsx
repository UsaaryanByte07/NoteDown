const sizeMap = {
  xs: { wrapper: 'inline-flex items-center justify-center', ring: 'h-4 w-4 border-2' },
  sm: { wrapper: 'inline-flex items-center justify-center', ring: 'h-5 w-5 border-2' },
  md: { wrapper: 'flex items-center justify-center min-h-[20vh] w-full', ring: 'h-8 w-8 border-3' },
  lg: { wrapper: 'flex items-center justify-center min-h-[50vh] w-full', ring: 'h-12 w-12 border-4' },
  full: { wrapper: 'flex items-center justify-center min-h-[50vh] w-full', ring: 'h-12 w-12 border-4' },
};

const Spinner = ({ size = 'full' }) => {
  const { wrapper, ring } = sizeMap[size] || sizeMap.full;
  return (
    <div className={wrapper}>
      <div className={`animate-spin rounded-full border-border border-t-primary ${ring}`}></div>
    </div>
  );
};

export default Spinner;