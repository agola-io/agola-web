import { mount } from '@vue/test-utils';
import baseModal from './baseModal.vue';

test('baseModal', async () => {
  const wrapper = mount(baseModal, {
    props: { show: true },
    global: {
      stubs: {
        teleport: true,
      },
    },
    attachTo: document.body,
  });
  // wait for focus trap to be ready
  await wrapper.vm.$nextTick();

  await wrapper.find('[tabindex="0"]').trigger('keydown', { key: 'Escape' });

  expect(wrapper.emitted().dismiss).toHaveLength(1);
  expect(wrapper.emitted().dismiss[0]).toEqual([false]);
});
